package lk.maga.procapp.service;

import lk.maga.procapp.dto.dashboard.*;
import lk.maga.procapp.repository.DashboardRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DashboardService {

    private static final List<String> AGING_BUCKET_ORDER =
            List.of("0-7", "8-14", "15-30", "31-60", "61-90", "91-180", "180+");
         
    private final DashboardRepository repo;
    
    public DashboardService(DashboardRepository repo) {
        this.repo = repo;
    }

    public DashboardSummaryResponse summary() {
        return new DashboardSummaryResponse(
                repo.outstandingCount(),
                repo.outstandingValue(),
                repo.totalActiveCount(),
                repo.totalInvoiceCount(),
                repo.currentMonthReceivedCount(),
                repo.currentMonthSubmittedCount(),
                repo.averageCycleDaysAllTime()
            );
    }

    public List<AgingBucketResponse> agingBuckets() {
        Map<String, AgingBucketResponse> byBucket = new HashMap<>();
        for (Object[] row : repo.agingBuckets()) {
            String bucket = (String) row[0];
            long count = ((Number) row[1]).longValue();
            BigDecimal total = (BigDecimal) row[2];
            byBucket.put(bucket, new AgingBucketResponse(bucket, count, total));

        }

        List<AgingBucketResponse> result = new ArrayList<>();
        for (String bucket : AGING_BUCKET_ORDER) {
            result.add(byBucket.getOrDefault(bucket, new AgingBucketResponse(bucket, 0, BigDecimal.ZERO)));
        }
        return result;
    }

    public List<AgingBreakdownRow> agingBreakdown() {
        List<AgingBreakdownRow> result = new ArrayList<>();
        for (Object[] row : repo.agingBreakdown()) {
            result.add(new AgingBreakdownRow(
                    (String) row[0],
                    ((Number) row[1]).longValue(),
                    (String) row[2],
                    (String) row[3],
                    ((Number) row[4]).longValue(),
                    (BigDecimal) row[5]
                ));
        }
        return result;
    }

    public List<TrendPoint> receivedVsSubmittedTrend() {
        Map<String, long[]> byMonth = new HashMap<>();
        for (Object[] row : repo.receivedCountByMonth(12)) {
            String month = (String) row[0];
            long count = ((Number) row[1]).longValue();
            byMonth.computeIfAbsent(month, m -> new long[2])[0] = count;
        }
        for (Object[] row : repo.submittedCountByMonths(12)) {
            String month = (String) row[0];
            long count = ((Number) row[1]).longValue();
            byMonth.computeIfAbsent(month, m -> new long[2])[1] = count;
        }
        return fixedTwelveMonths(byMonth, "trend");
    }

    private List<TrendPoint> fixedTwelveMonths(Map<String, long[]> byMonth, String ignored) {
        List<TrendPoint> result = new ArrayList<>();
        YearMonth cursor = YearMonth.now().minusMonths(11);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        for (int i = 0; i < 12; i++) {
            String key = cursor.format(fmt);
            long[] counts = byMonth.getOrDefault(key, new long[2]);
            result.add(new TrendPoint(key, counts[0], counts[1]));
            cursor = cursor.plusMonths(1);
        }
        return result;
    }

    public List<MonthlyVolumePoint> monthlyVolume() {
        Map<String, Long> byMonth = new HashMap<>();
        for (Object[] row : repo.volumeByMonth(12)) {
            byMonth.put((String) row[0], ((Number) row[1]).longValue());
        }
        List<MonthlyVolumePoint> result = new ArrayList<>();
        YearMonth cursor = YearMonth.now().minusMonths(11);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        for (int i = 0; i < 12; i++) {
            String key = cursor.format(fmt);
            result.add(new MonthlyVolumePoint(key, byMonth.getOrDefault(key, 0L)));
            cursor = cursor.plusMonths(1);

        }
        return result;
    }

    public CycleTimeResponse cycleTime() {
        LocalDate now = LocalDate.now();
        LocalDate prevMonth = now.minusMonths(1);

        Double current  = repo.averageCycleDaysForMonth(now.getYear(), now.getMonthValue());
        Double previous = repo.averageCycleDaysForMonth(prevMonth.getYear(), prevMonth.getMonthValue());
        double allTime = repo.averageCycleDaysAllTime();
        return new CycleTimeResponse(current, previous, allTime);
    }

    public List<FinanceBatchSummary> recentFinanceBatches() {
        List<FinanceBatchSummary> result = new ArrayList<>();
        for (Object[] row : repo.recentFinanceBatches(10)) {
            result.add(new FinanceBatchSummary(
                (String) row[0],
                ((java.sql.Date) row[1]).toLocalDate(),
                ((Number) row[2]).longValue(),
                (BigDecimal) row[3]
                
            ));
        }
        return result;
    }
     
}
