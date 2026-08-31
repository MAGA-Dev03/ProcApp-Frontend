package lk.maga.procapp.repository;

import lk.maga.procapp.entity.Invoice;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.JoinType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class InvoiceSpecifications {

    public static Specification<Invoice> projectId(Long projectId) {
        return (root, query, cb) -> projectId == null ? null :
                cb.equal(root.get("project").get("id"), projectId);
    }

    public static Specification<Invoice> supplierId(Long supplierId) {
        return (root, query, cb) -> supplierId == null ? null :
                cb.equal(root.get("supplier").get("id"), supplierId);
    }

    public static Specification<Invoice> invoiceType(String type) {
        return (root, query, cb) -> (type == null || type.isBlank()) ? null :
                cb.equal(root.get("invoiceType"), type);
    }

    public static Specification<Invoice> invoiceSource(String source) {
        return (root, query, cb) -> (source == null || source.isBlank()) ? null :
                cb.equal(root.get("invoiceType"), source);

    }

    public static Specification<Invoice> active(Boolean active) {
        return (root, query, cb) -> active == null ? null :
                cb.equal(root.get("active"), active);
    }

    public static Specification<Invoice> invoiceDateFrom(LocalDate from) {
        return (root, query, cb) -> from == null ? null :
                cb.greaterThanOrEqualTo(root.get("invoiceDate"), from);
    }

    public static Specification<Invoice> invoiceDateTo(LocalDate to) {
        return (root, query, cb) -> to == null ? null :
                cb.lessThanOrEqualTo(root.get("invoiceDate"), to);
    }

    public static Specification<Invoice> valueMin(BigDecimal min) {
        return (root, query, cb) -> min == null ? null :
                cb.greaterThanOrEqualTo(root.get("value"), min);
    }

    public static Specification<Invoice> valueMax(BigDecimal max) {
        return (root, query, cb) -> max == null ? null :
                cb.lessThanOrEqualTo(root.get("value"), max);
    }

    public static Specification<Invoice> search(String term) {
        return (root, query, cb) -> {
            if (term == null || term.isBlank()) return null;
            String pattern = "%" + term.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("invoiceNumber")), pattern),
                cb.like(cb.lower(root.get("purchaseOrderNumber")), pattern),
                cb.like(cb.lower(root.get("pioNumber")), pattern)
            );
        };
    }

    public static  Specification<Invoice> outstandingOnly(boolean outstandingOnly) {
        return (root, query, cb) -> !outstandingOnly ? null :
                cb.and(cb.isTrue(root.get("active")), cb.isNull(root.get("listNo")));
    }

    public static Specification<Invoice> withFetchedRelations() {
        return (root, query, cb) -> {
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("project", JoinType.LEFT);
                root.fetch("supplier", JoinType.LEFT);
                root.fetch("author", JoinType.LEFT);
                root.fetch("updatedBy", JoinType.LEFT);
                query.distinct(true);
            }
            return cb.conjunction();
        };
    }
    
}
