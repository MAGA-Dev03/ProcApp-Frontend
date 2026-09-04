package lk.maga.procapp.controller;

import jakarta.validation.Valid;
import lk.maga.procapp.dto.LoginRequest;
import lk.maga.procapp.dto.LoginResponse;
import lk.maga.procapp.dto.RoleResponse;
import lk.maga.procapp.dto.ProjectResponse;
import lk.maga.procapp.security.CustomUserDetails;
import lk.maga.procapp.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authResult;
        try {
            authResult = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException | DisabledException e) {
            // Deliberately identical response whether the password was
            // wrong OR the account is inactive — never let a login attempt
            // reveal which case it was.
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        CustomUserDetails userDetails = (CustomUserDetails) authResult.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        lk.maga.procapp.entity.User u = userDetails.getUser();

        List<RoleResponse> roles = u.getRoles().stream().map(RoleResponse::new).toList();
        List<ProjectResponse> projects = u.getProjects().stream().map(ProjectResponse::new).toList();

        LoginResponse.UserPayload payload = new LoginResponse.UserPayload(
            u.getId(), u.getName(), u.getEmail(), u.isAllProjects(), u.isActive(),
            u.getCreatedAt(), roles, projects
        );

        return ResponseEntity.ok(new LoginResponse(token, payload));
        
    }
}