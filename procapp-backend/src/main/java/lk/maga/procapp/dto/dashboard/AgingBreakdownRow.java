package lk.maga.procapp.dto.dashboard;

import lombok.Getter;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class AgingBreakdownRow {
    private String bucket;
    private Long projectId;
    private String projectCode;
    private String projectName;
    private Long count;
    private BigDecimal totalValue;
    
}
