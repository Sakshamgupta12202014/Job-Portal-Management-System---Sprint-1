package com.capg.jobportal.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.capg.jobportal.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Component
@Slf4j
@RequiredArgsConstructor
public class GatewayJwtFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String method = request.getMethod().name();

        log.debug("=== FILTER CALLED === Path: {} Method: {}", path, method);

        
     // Block all internal endpoints from external access
        if (path.contains("/internal/")) {
            log.warn("=== BLOCKING INTERNAL ENDPOINT === Path: {}", path);
            return onError(exchange, HttpStatus.FORBIDDEN);
        }
        
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        boolean hasToken = authHeader != null && authHeader.startsWith("Bearer ");

        // If it's a public route AND no token is provided, just let it pass
        if (isPublicRoute(path, method) && !hasToken) {
            return chain.filter(exchange);
        }
        
        // If no token is provided and it's NOT a public route, block it
        if (!hasToken) {
            return onError(exchange, HttpStatus.UNAUTHORIZED);
        }

        // Token is provided, validate it
        String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            return onError(exchange, HttpStatus.UNAUTHORIZED);
        }

        // Extract user info
        String userId = jwtUtil.extractUserId(token);
        String role = jwtUtil.extractRole(token);

        log.debug("=== GATEWAY DEBUG === Path: {}, UserId: {}, Role: {}", path, userId, role);

        // Inject headers and proceed
        ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-User-Id", userId)
                .header("X-User-Role", role)
                .build();

        return chain.filter(exchange.mutate().request(modifiedRequest).build());
    }

    private boolean isPublicRoute(String path, String method) {
        if (path.equals("/api/auth/register")) return true;
        if (path.equals("/api/auth/login")) return true;
        if (path.equals("/api/auth/refresh")) return true;

        if ("GET".equalsIgnoreCase(method)) {
            if (path.equals("/api/jobs")) return true;
            if (path.equals("/api/jobs/search")) return true;
            if (path.matches("/api/jobs/\\d+")) return true;
            if (path.equals("/api/admin/public/stats")) return true;
        }

        return false;
    }

    
    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.setComplete();
    }

    
    @Override
    public int getOrder() {
        return -1;
    }
}