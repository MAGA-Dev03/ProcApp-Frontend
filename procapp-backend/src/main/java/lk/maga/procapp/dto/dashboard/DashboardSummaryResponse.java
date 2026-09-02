package lk.maga.procapp.dto.dashboard;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long outstandingCount;
    private BigDecimal outstandingValue;
    private long totalActiveCount;
    private long totalInvoiceCount;
    private long currentMonthReceivedCount;
    private long currentMonthSubmittedCount;
    private double averageCycleTimeDays;

    
}
