package lk.maga.procapp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            Claims claims = jwtService.parseClaims(token);
            Long userId = claims.get("userId", Long.class);
            @SuppressWarnings("unchecked")
            List<String> roles = claims.get("roles", List.class);

            List<GrantedAuthority> authorities = roles.stream()
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                    .collect(Collectors.toList());

            // Authorities come straight from the token claims, not a fresh
            // DB lookup — cheap and stateless, at the cost of a role change
            // only taking effect on the user's next login. Acceptable
            // trade-off for a 10-hour token lifetime.
            var authToken = new UsernamePasswordAuthenticationToken(
                    userId, null, authorities
            );
            SecurityContextHolder.getContext().setAuthentication(authToken);

        } catch (JwtException | IllegalArgumentException e) {
    System.out.println("JWT validation failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
    SecurityContextHolder.clearContext();
}

        filterChain.doFilter(request, response);
    }
}