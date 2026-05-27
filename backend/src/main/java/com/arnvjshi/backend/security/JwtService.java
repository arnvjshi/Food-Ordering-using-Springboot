package com.arnvjshi.backend.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.arnvjshi.backend.entity.AppUser;

@Service
public class JwtService {

    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();

    private final SecretKeySpec secretKeySpec;
    private final Duration ttl;

    public JwtService(@Value("${app.jwt-secret}") String secret,
                      @Value("${app.jwt-ttl-hours}") long ttlHours) {
        this.secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        this.ttl = Duration.ofHours(ttlHours);
    }

    public String createToken(AppUser user) {
        try {
            long issuedAt = Instant.now().getEpochSecond();
            long expiresAt = Instant.now().plus(ttl).getEpochSecond();
            String payload = String.join("|",
                    "sub=" + encode(user.getUsername()),
                    "name=" + encode(user.getFullName()),
                    "roles=" + encode(String.join(",", user.getRoles())),
                    "iat=" + issuedAt,
                    "exp=" + expiresAt);
            return payload + "." + sign(payload);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to create token", exception);
        }
    }

    public Optional<JwtClaims> parseToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2) {
                return Optional.empty();
            }

            String payload = parts[0];
            if (!MessageDigest.isEqual(DECODER.decode(parts[1]), DECODER.decode(sign(payload)))) {
                return Optional.empty();
            }

            Map<String, String> values = parsePayload(payload);
            long expiresAt = Long.parseLong(values.getOrDefault("exp", "0"));
            if (Instant.now().getEpochSecond() >= expiresAt) {
                return Optional.empty();
            }

            Set<String> roles = new LinkedHashSet<>();
            String encodedRoles = values.getOrDefault("roles", "");
            if (!encodedRoles.isBlank()) {
                roles.addAll(Arrays.stream(decode(encodedRoles).split(","))
                        .filter(role -> !role.isBlank())
                        .toList());
            }

            return Optional.of(new JwtClaims(
                    decode(values.getOrDefault("sub", "")),
                    decode(values.getOrDefault("name", values.getOrDefault("sub", ""))),
                    List.copyOf(roles)));
        } catch (Exception exception) {
            return Optional.empty();
        }
    }

    private Map<String, String> parsePayload(String payload) {
        Map<String, String> values = new LinkedHashMap<>();
        for (String segment : payload.split("\\|")) {
            String[] pair = segment.split("=", 2);
            if (pair.length == 2) {
                values.put(pair[0], pair[1]);
            }
        }
        return values;
    }

    private String sign(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(secretKeySpec);
        return ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    public record JwtClaims(String username, String fullName, List<String> roles) {
    }
}