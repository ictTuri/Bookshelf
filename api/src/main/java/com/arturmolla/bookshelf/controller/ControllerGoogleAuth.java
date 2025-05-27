package com.arturmolla.bookshelf.controller;

import com.arturmolla.bookshelf.model.user.User;
import com.arturmolla.bookshelf.repository.RepositoryUser;
import com.arturmolla.bookshelf.security.GoogleTokenVerifier;
import com.arturmolla.bookshelf.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class ControllerGoogleAuth {

    @Autowired
    private GoogleTokenVerifier googleTokenVerifier;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private RepositoryUser userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/google")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> googleTokenRequest) {
        String googleToken = googleTokenRequest.get("idToken");
        if (googleToken == null || googleToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Google token is required"));
        }

        Map<String, Object> googleUserInfo = googleTokenVerifier.verifyGoogleToken(googleToken);
        if (googleUserInfo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid Google token"));
        }

        String email = (String) googleUserInfo.get("email");
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Register new user with Google info
            user = new User();
            user.setEmail(email);
            user.setFirstname((String) googleUserInfo.get("givenName"));
            user.setLastname((String) googleUserInfo.get("familyName"));
            user.setEnabled(true);
            user.setProvider("GOOGLE");
            // Set a random password or a constant, since Google users don't use password login
            user.setPassword(passwordEncoder.encode("google-auth-user"));
            userRepository.save(user);
        }

        // Generate our application's JWT token
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
