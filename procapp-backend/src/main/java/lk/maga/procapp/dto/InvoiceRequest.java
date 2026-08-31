package lk.maga.procapp.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;


@Getter
@Setter
public class InvoiceRequest {

    @NotBlank
    @Pattern(regexp = "CREDIT|ADVANCE|LC")
    private String invoiceType;

    @NotBlank
    @Pattern(regexp = "DIRECT|STORES|PROJECT")
    private String invoiceSource;

    @NotNull
    private Long projectId;

    @NotNull
    private Long supplierId;

    @NotBlank
    private String invoiceNumber;

    @NotNull
    private LocalDate invoiceDate;

    @NotNull
    private LocalDate receivedDate;

    @NotBlank
    private String purchaseOrderNumber;

    @NotNull
    @DecimalMin(value = "0.01", message = "value must be greater than 0")
    private BigDecimal value;

    private String pioNumber;
    private String grnNumber;
    private LocalDate grnReceivedDate;
    private String remarks;
    private String attachmentUrl;
    private Long id;
    private java.time.OffsetDateTime createdAt;
    private Long authorUserId;
    
}
