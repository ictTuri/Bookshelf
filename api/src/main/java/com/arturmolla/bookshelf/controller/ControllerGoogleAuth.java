package com.bookshelf.controller;

import com.bookshelf.security.GoogleTokenVerifier;
import com.bookshelf.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private GoogleTokenVerifier googleTokenVerifier;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/google")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> googleTokenRequest) {
        String googleToken = googleTokenRequest.get("token");
        if (googleToken == null || googleToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Google token is required"));
        }

        Map<String, Object> googleUserInfo = googleTokenVerifier.verifyGoogleToken(googleToken);
        if (googleUserInfo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid Google token"));
        }

        // Generate our application's JWT token
        String email = (String) googleUserInfo.get("email");
        String jwt = jwtTokenProvider.createToken(
                email,
                googleUserInfo,
                Collections.singletonList("ROLE_USER")
        );

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("user", googleUserInfo);
        
        return ResponseEntity.ok(response);
    }
}
