package lk.maga.procapp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GrnRequest {
    @NotBlank
    private String grnNumber;
    
}
