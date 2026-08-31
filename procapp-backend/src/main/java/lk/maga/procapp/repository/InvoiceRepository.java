package lk.maga.procapp.repository;

import lk.maga.procapp.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

    @Query("SELECT i FROM Invoice i " +
            "LEFT JOIN FETCH i.project " +
            "LEFT JOIN FETCH i.supplier " +
            "LEFT JOIN FETCH i.author " +
            "LEFT JOIN FETCH i.updatedBy " +
            "WHERE i.id = :id")
    Optional<Invoice> findByIdWithRelations(@Param("id") Long id);

    @Query("SELECT COUNT(i) > 0 FROM Invoice i WHERE i.supplier.id = :supplierId " +
        "AND LOWER(TRIM(i.invoiceNumber)) = LOWER(TRIM(CAST(:invoiceNumber AS string)))")
    boolean existsDuplicate(
        @Param("supplierId") Long supplierId,
        @Param("invoiceNumber") String invoiceNumber
    );

    @Query("SELECT COUNT(i) > 0 FROM Invoice i WHERE i.supplier.id = :supplierId " +
        "AND LOWER(TRIM(i.invoiceNumber)) = LOWER(TRIM(CAST(:invoiceNumber AS string))) " +
        "AND i.id <> :excludeInvoiceId")
    boolean existsDuplicateExcluding(
        @Param("supplierId") Long supplierId,
        @Param("invoiceNumber") String invoiceNumber,
        @Param("excludeInvoiceId") Long excludeInvoiceId
    );
}