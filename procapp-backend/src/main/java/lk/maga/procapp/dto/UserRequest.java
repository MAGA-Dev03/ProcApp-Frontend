package lk.maga.procapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
public class UserRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    // Required on create, optional on update (blank/null = keep existing
    // hash). Enforced in the service layer, not here, since the same DTO
    // serves both operations with different rules.
    private String password;

    private boolean allProjects;

    // Empty sets are valid states — do NOT reintroduce a "must have at
    // least one role/project" check here or in the service.
    private Set<Long> roleIds = new HashSet<>();
    private Set<Long> projectIds = new HashSet<>();

    private Boolean active; // nullable so create() can default it to true
}