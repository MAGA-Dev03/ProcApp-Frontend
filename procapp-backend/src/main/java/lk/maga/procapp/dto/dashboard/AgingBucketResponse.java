package lk.maga.procapp.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class AgingBucketResponse {
    private String bucket;
    private long count;
    private BigDecimal totalAmount;
    
}
