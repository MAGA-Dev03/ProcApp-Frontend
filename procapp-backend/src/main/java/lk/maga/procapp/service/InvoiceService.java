package lk.maga.procapp.service;

import lk.maga.procapp.dto.InvoiceRequest;
import lk.maga.procapp.entity.Invoice;
import lk.maga.procapp.entity.Project;
import lk.maga.procapp.entity.Supplier;
import lk.maga.procapp.entity.User;
import lk.maga.procapp.exception.ValidationException;
import lk.maga.procapp.repository.InvoiceRepository;
import lk.maga.procapp.repository.InvoiceSpecifications;
import lk.maga.procapp.repository.ProjectRepository;
import lk.maga.procapp.repository.SupplierRepository;
import lk.maga.procapp.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ProjectRepository projectRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            ProjectRepository projectRepository,
            SupplierRepository supplierRepository,
            UserRepository userRepository
    ) {
        this.invoiceRepository = invoiceRepository;
        this.projectRepository = projectRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
    }

    public Page<Invoice> list(
            Long projectId, Long supplierId, String invoiceType, String invoiceSource,
            Boolean active, LocalDate dateFrom, LocalDate dateTo,
            BigDecimal valueMin, BigDecimal valueMax, String search,
            Pageable pageable
    ) {
        Specification<Invoice> spec = Specification.where(InvoiceSpecifications.projectId(projectId))
                .and(InvoiceSpecifications.supplierId(supplierId))
                .and(InvoiceSpecifications.invoiceType(invoiceType))
                .and(InvoiceSpecifications.invoiceSource(invoiceSource))
                .and(InvoiceSpecifications.active(active))
                .and(InvoiceSpecifications.invoiceDateFrom(dateFrom))
                .and(InvoiceSpecifications.invoiceDateTo(dateTo))
                .and(InvoiceSpecifications.valueMin(valueMin))
                .and(InvoiceSpecifications.valueMax(valueMax))
                .and(InvoiceSpecifications.search(search))
                .and(InvoiceSpecifications.withFetchedRelations());
        return invoiceRepository.findAll(spec, pageable);
    }

    public Invoice getOrThrow(Long id) {
        return invoiceRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));
    }

    @Transactional
    public Invoice create(InvoiceRequest req, Long authorUserId, Collection<? extends GrantedAuthority> authorities) {
        Map<String, String> fieldErrors = new HashMap<>();

        Project project = projectRepository.findById(req.getProjectId()).orElse(null);
        if (project == null) fieldErrors.put("projectId", "Project does not exist.");

        Supplier supplier = supplierRepository.findById(req.getSupplierId()).orElse(null);
        if (supplier == null) fieldErrors.put("supplierId", "Supplier does not exist.");

        if (req.getRemarks() != null && !req.getRemarks().isBlank() && !isProcurementManager(authorities)) {
            fieldErrors.put("remarks", "Only Procurement Manager can set remarks.");
        }

        if (!fieldErrors.isEmpty()) {
            throw new ValidationException(fieldErrors);
        }

        User author = userRepository.findById(authorUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session user"));

        Invoice inv = new Invoice();
        applyFields(inv, req, project, supplier);
        inv.setAuthor(author); // from session, never from the request body
        inv.setActive(true);
        OffsetDateTime now = OffsetDateTime.now();
        inv.setCreatedAt(now);
        inv.setUpdatedAt(now);

        return invoiceRepository.save(inv);
    }

    @Transactional
    public Invoice update(Long id, InvoiceRequest req, Long currentUserId, Collection<? extends GrantedAuthority> authorities) {
        Invoice inv = getOrThrow(id);
        Map<String, String> fieldErrors = new HashMap<>();

        // Explicit rejection of immutable-field tampering, per the contract
        // — not silent ignoring.
        if (req.getId() != null && !req.getId().equals(id)) {
            fieldErrors.put("id", "id cannot be changed.");
        }
        if (req.getCreatedAt() != null) {
            fieldErrors.put("createdAt", "createdAt cannot be changed.");
        }
        if (req.getAuthorUserId() != null && !req.getAuthorUserId().equals(inv.getAuthor().getId())) {
            fieldErrors.put("authorUserId", "authorUserId cannot be changed.");
        }

        Project project = projectRepository.findById(req.getProjectId()).orElse(null);
        if (project == null) fieldErrors.put("projectId", "Project does not exist.");

        Supplier supplier = supplierRepository.findById(req.getSupplierId()).orElse(null);
        if (supplier == null) fieldErrors.put("supplierId", "Supplier does not exist.");

        boolean remarksChanged = !java.util.Objects.equals(req.getRemarks(), inv.getRemarks());
        if (remarksChanged && !isProcurementManager(authorities)) {
            fieldErrors.put("remarks", "Only Procurement Manager can change remarks.");
        }

        if (!fieldErrors.isEmpty()) {
            throw new ValidationException(fieldErrors);
        }

        User updatedBy = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session user"));

        applyFields(inv, req, project, supplier);
        inv.setUpdatedBy(updatedBy);
        inv.setUpdatedAt(OffsetDateTime.now());

        return invoiceRepository.save(inv);
    }

    @Transactional
    public void delete(Long id) {
        // Hard delete — for data-entry mistakes only. Deliberately
        // different from cancel/activate (Phase 6), which is an
        // audit-preserving soft toggle instead.
        Invoice inv = getOrThrow(id);
        invoiceRepository.delete(inv);
    }

    public boolean checkDuplicate(Long supplierId, String invoiceNumber, Long excludeInvoiceId) {
        if (excludeInvoiceId == null) {
            return invoiceRepository.existsDuplicate(supplierId, invoiceNumber);
    }
        return invoiceRepository.existsDuplicateExcluding(supplierId, invoiceNumber, excludeInvoiceId);
}

    private boolean isProcurementManager(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_PROCUREMENT_MANAGER"));
    }

    private void applyFields(Invoice inv, InvoiceRequest req, Project project, Supplier supplier) {
        inv.setInvoiceType(req.getInvoiceType());
        inv.setInvoiceSource(req.getInvoiceSource());
        inv.setProject(project);
        inv.setSupplier(supplier);
        inv.setInvoiceNumber(req.getInvoiceNumber());
        inv.setInvoiceDate(req.getInvoiceDate());
        inv.setReceivedDate(req.getReceivedDate());
        inv.setPurchaseOrderNumber(req.getPurchaseOrderNumber());
        inv.setValue(req.getValue());
        inv.setPioNumber(req.getPioNumber());
        inv.setGrnNumber(req.getGrnNumber());
        inv.setGrnReceivedDate(req.getGrnReceivedDate());
        inv.setRemarks(req.getRemarks());
        inv.setAttachmentUrl(req.getAttachmentUrl());
    }

    @Transactional
    public Invoice cancel(Long id, Long currentUserId) {
        Invoice inv = getOrThrow(id);
        inv.setActive(false);
        inv.setUpdatedBy(userRepository.findById(currentUserId).orElse(null));
        inv.setUpdatedAt(OffsetDateTime.now());
        return invoiceRepository.save(inv);
    }

    @Transactional
    public Invoice activate(Long id, Long currentUserId) {
        Invoice inv = getOrThrow(id);
        inv.setActive(true);
        inv.setUpdatedBy(userRepository.findById(currentUserId).orElse(null));
        inv.setUpdatedAt(OffsetDateTime.now());
        return invoiceRepository.save(inv);

    }

    @Transactional
    public Invoice setGrn(Long id, String grnNumber, Long currentUserId) {
        Invoice inv = getOrThrow(id);
        inv.setGrnNumber(grnNumber);
        inv.setUpdatedBy(userRepository.findById(currentUserId).orElse(null));
        inv.setUpdatedAt(OffsetDateTime.now());
        return invoiceRepository.save(inv);
    }

    @Transactional
    public Invoice markAttachmentViewed(Long id) {
        Invoice inv = getOrThrow(id);
        inv.setAttachmentViewed(true);
        return invoiceRepository.save(inv);
    }

    @Transactional
    public Invoice clearFinanceSubmission(Long id, Long currentUserId) {
        Invoice inv = getOrThrow(id);
        inv.setListNo(null);
        inv.setFinanceSubmitDate(null);
        inv.setUpdatedBy(userRepository.findById(currentUserId).orElse(null));
        inv.setUpdatedAt(OffsetDateTime.now());
        return invoiceRepository.save(inv);
    }

    public Page<Invoice> listForSiteKeeper(Long userId, Long requestedProjectId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session user"));
        java.util.Set<Long> allowedProjectIds = user.isAllProjects()
                ? null
                : user.getProjects().stream().map(Project::getId).collect(java.util.stream.Collectors.toSet());    
        Specification<Invoice> spec = Specification
                .where(InvoiceSpecifications.scopedToProjectIds(allowedProjectIds))
                .and(InvoiceSpecifications.withFetchedRelations());
                
        if (requestedProjectId != null) {
            spec = spec.and(InvoiceSpecifications.projectId(requestedProjectId));
        }       
        return invoiceRepository.findAll(spec, pageable);
    }
}