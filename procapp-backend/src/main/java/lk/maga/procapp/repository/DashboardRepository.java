package lk.maga.procapp.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.math.BigDecimal;
import java.util.List;

@Repository
public class DashboardRepository {

    private final EntityManager em;
    
    public DashboardRepository(EntityManager em) {
        this.em = em;
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> agingBuckets() {
        Query q = em.createNativeQuery(
                "SELECT " +
                "CASE " +
                "  WHEN (CURRENT_DATE - received_date) <= 7 THEN '0-7' " +
                " WHEN (CURRENT_DATE - received_date) <= 14 THEN '8-14' " +
                " WHEN (CURRENT_DATE - received_date) <= 30 THEN '15-30' " +
                " WHEN (CURRENT_DATE - received_date) <= 60 THEN '31-60' " +
                " WHEN (CURRENT_DATE - received_date) <= 90 THEN '61-90' " +
                " WHEN (CURRENT_DATE - received_date) <= 180 THEN '91-180' " +
                " ELSE '180+' " +
                " END AS bucket, " +
                " COUNT(*) AS cnt, " +
                " COALESCE(SUM(value), 0) AS total_value " +
                " FROM invoices " +
                " WHERE active = true AND list_no IS NULL " +
                " GROUP BY bucket "
            
        );
        return q.getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> agingBreakdown() {
        Query q = em.createNativeQuery(
                "SELECT " +
                " CASE " +
                "   WHEN (CURRENT_DATE - received_date) <= 7 THEN '0-7' " +
                "   WHEN (CURRENT_DATE - received_date) <= 14 THEN '8-14' " +
                "   WHEN (CURRENT_DATE - received_date) <= 30 THEN '15-30' " +
                "   WHEN (CURRENT_DATE - received_date) <= 60 THEN '31-60' " +
                "   WHEN (CURRENT_DATE - received_date) <= 90 THEN '61-90' " +
                "   WHEN (CURRENT_DATE - received_date) <= 180 THEN '91-180' " +
                "   ELSE '180+' " +
                " END AS bucket, " +
                " p.id, p.code, p.name, " +
                " COUNT(*) AS cnt, " +
                " COALESCE(SUM(i.value), 0) AS total_value " +
                " FROM invoices i  JOIN projects p ON i.project_id = p.id " +
                "WHERE i.active = true AND i.list_no IS NULL " +
                "GROUP BY bucket, p.id, p.code, p.name " +
                "ORDER BY bucket, total_value DESC"
            
        );
        return q.getResultList();

    }

    @SuppressWarnings("unchecked")
    public List<Object[]> receivedCountByMonth(int monthsBack) {
        Query q = em.createNativeQuery(
            "SELECT TO_CHAR(received_date, 'YYYY-MM') AS month, COUNT(*) " +
            "FROM invoices " +
            "WHERE received_date >= (CURRENT_DATE - (INTERVAL '1 month' * :monthsBack)) " +
            "GROUP BY month"
        );
        q.setParameter("monthsBack", monthsBack);
        return q.getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> submittedCountByMonths(int monthsBack) {
        Query q = em.createNativeQuery(
            "SELECT TO_CHAR(finance_submit_date, 'YYYY-MM') AS month, COUNT(*) " +
            "FROM invoices " +
            "WHERE finance_submit_date >= (CURRENT_DATE - (INTERVAL '1 month' * :monthsBack)) " +
            "GROUP BY month"
        );
        q.setParameter("monthsBack", monthsBack);
        return q.getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> volumeByMonth(int monthsBack) {
        Query q = em.createNativeQuery(
                "SELECT TO_CHAR(received_date, 'YYYY-MM') AS month, COUNT(*) " +
                "FROM invoices " +
                "WHERE received_date >= (CURRENT_DATE - (INTERVAL '1 month' * :monthsBack)) " +
                "GROUP BY month"
        );
        q.setParameter("monthsBack", monthsBack);
        return q.getResultList();
    }

    public Double averageCycleDaysForMonth(int year, int month) {
        Query q = em.createNativeQuery(
                "SELECT AVG(finance_submit_date - received_date) " +
                "FROM invoices " +
                "WHERE finance_submit_date IS NOT NULL " +
                "AND EXTRACT(YEAR FROM finance_submit_date) = :year " +
                "AND EXTRACT(MONTH FROM finance_submit_date) = :month"
        );
        q.setParameter("year", year);
        q.setParameter("month", month);
        Object result = q.getSingleResult();
        return result == null ? null : ((Number) result).doubleValue();
    }

    public double averageCycleDaysAllTime() {
        Query q = em.createNativeQuery(
                "SELECT AVG(finance_submit_date - received_date) " +
                "FROM invoices WHERE finance_submit_date IS NOT NULL"
        );
        Object result = q.getSingleResult();
        return result == null ? 0.0 : ((Number) result).doubleValue();
    }

     @SuppressWarnings("unchecked")
    public List<Object[]> recentFinanceBatches(int limit) {
        Query q = em.createNativeQuery(
                "SELECT list_no, finance_submit_date, COUNT(*), COALESCE(SUM(value), 0) " +
                "FROM invoices " +
                "WHERE list_no IS NOT NULL " +
                "GROUP BY list_no, finance_submit_date " +
                "ORDER BY finance_submit_date DESC " +
                "LIMIT :limit"
        );
        q.setParameter("limit", limit);
        return q.getResultList();
    }

    public long outstandingCount() {
        Query q = em.createNativeQuery(
                "SELECT COUNT(*) FROM invoices WHERE active = true AND list_no IS NULL"
        );
        return ((Number) q.getSingleResult()).longValue();
    }

    public BigDecimal outstandingValue() {
        Query q = em.createNativeQuery(
                "SELECT COALESCE(SUM(value), 0) FROM invoices WHERE active = true AND list_no IS NULL"
        );
        return (BigDecimal) q.getSingleResult();
    }

     public long totalActiveCount() {
        Query q = em.createNativeQuery("SELECT COUNT(*) FROM invoices WHERE active = true");
        return ((Number) q.getSingleResult()).longValue();
    }

    public long totalInvoiceCount() {
        Query q = em.createNativeQuery("SELECT COUNT(*) FROM invoices");
        return ((Number) q.getSingleResult()).longValue();
    }

    public long currentMonthReceivedCount() {
        Query q = em.createNativeQuery(
                "SELECT COUNT(*) FROM invoices " +
                "WHERE EXTRACT(YEAR FROM received_date) = EXTRACT(YEAR FROM CURRENT_DATE) " +
                "AND EXTRACT(MONTH FROM received_date) = EXTRACT(MONTH FROM CURRENT_DATE)"
        );
        return ((Number) q.getSingleResult()).longValue();
    }

    public long currentMonthSubmittedCount() {
        Query q = em.createNativeQuery(
                "SELECT COUNT(*) FROM invoices " +
                "WHERE finance_submit_date IS NOT NULL " +
                "AND EXTRACT(YEAR FROM finance_submit_date) = EXTRACT(YEAR FROM CURRENT_DATE) " +
                "AND EXTRACT(MONTH FROM finance_submit_date) = EXTRACT(MONTH FROM CURRENT_DATE)"
        );
        return ((Number) q.getSingleResult()).longValue();
    }
}
