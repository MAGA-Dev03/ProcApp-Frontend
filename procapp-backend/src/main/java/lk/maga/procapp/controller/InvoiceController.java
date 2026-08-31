package lk.maga.procapp.controller;

import jakarta.validation.Valid;
import lk.maga.procapp.dto.InvoiceRequest;
import lk.maga.procapp.dto.InvoiceResponse;
import lk.maga.procapp.dto.PageResponse;
import lk.maga.procapp.entity.Invoice;
import lk.maga.procapp.security.RoleNames;
import lk.maga.procapp.service.InvoiceService;
import lk.maga.procapp.service.InvoiceStatusService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/invoices")
@PreAuthorize("hasAnyRole('" + RoleNames.PROCUREMENT + "', '" + RoleNames.PROCUREMENT_MANAGER + "')")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoiceStatusService statusService;

    public InvoiceController(InvoiceService invoiceService, InvoiceStatusService statusService) {
        this.invoiceService = invoiceService;
        this.statusService = statusService;
    }

    @GetMapping
    public PageResponse<InvoiceResponse> list(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String invoiceType,
            @RequestParam(required = false) String invoiceSource,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) BigDecimal valueMin,
            @RequestParam(required = false) BigDecimal valueMax,
            @RequestParam(required = false) String search,
            Pageable pageable
    ) {
        var page = invoiceService.list(
                projectId, supplierId, invoiceType, invoiceSource, active,
                dateFrom, dateTo, valueMin, valueMax, search, pageable
        );
        return PageResponse.from(page, inv -> new InvoiceResponse(inv, statusService));
    }

    @GetMapping("/{id}")
    public InvoiceResponse getOne(@PathVariable Long id) {
        return new InvoiceResponse(invoiceService.getOrThrow(id), statusService);
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(
            @Valid @RequestBody InvoiceRequest req, Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal();
        Invoice created = invoiceService.create(req, userId, authentication.getAuthorities());
        return ResponseEntity.ok(new InvoiceResponse(created, statusService));
    }

    @PutMapping("/{id}")
    public InvoiceResponse update(
            @PathVariable Long id, @Valid @RequestBody InvoiceRequest req, Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal();
        Invoice updated = invoiceService.update(id, req, userId, authentication.getAuthorities());
        return new InvoiceResponse(updated, statusService);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        invoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check-duplicate")
    public java.util.Map<String, Boolean> checkDuplicate(
            @RequestParam Long supplierId,
            @RequestParam String invoiceNumber,
            @RequestParam(required = false) Long excludeInvoiceId
    ) {
        boolean isDuplicate = invoiceService.checkDuplicate(supplierId, invoiceNumber, excludeInvoiceId);
        return java.util.Map.of("isDuplicate", isDuplicate);
    }
}