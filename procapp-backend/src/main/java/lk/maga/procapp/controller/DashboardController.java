package lk.maga.procapp.controller;

import lk.maga.procapp.dto.dashboard.*;
import lk.maga.procapp.security.RoleNames;
import lk.maga.procapp.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('" + RoleNames.SENIOR_MANAGER + "')")

public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse summary() {
        return dashboardService.summary();
    }

    @GetMapping("/aging-buckets")
    public List<AgingBucketResponse> agingBuckets() {
        return dashboardService.agingBuckets();
    }

    @GetMapping("/aging-buckets/breakdown")
    public List<AgingBreakdownRow> agingBreakdown() {
        return dashboardService.agingBreakdown();
    }

    @GetMapping("/received-vs-submitted-trend")
    public List<TrendPoint> receivedVsSubmittedTrend() {
        return dashboardService.receivedVsSubmittedTrend();
    }

    @GetMapping("/monthly-volume")
    public  List<MonthlyVolumePoint> monthlyVolume() {
        return dashboardService.monthlyVolume();
    }

    @GetMapping("/cycle-time")
    public CycleTimeResponse cycleTime() {
        return dashboardService.cycleTime();
    }

    @GetMapping("/recent-finance-batches")
    public List<FinanceBatchSummary> recentFinanceBatches() {
        return dashboardService.recentFinanceBatches();
    }
}
