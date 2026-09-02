package lk.maga.procapp.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TrendPoint {
    private String month;
    private long receivedCount;
    private long submittedCount;
    
}
