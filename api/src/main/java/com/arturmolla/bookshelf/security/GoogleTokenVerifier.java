package com.arturmolla.bookshelf.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Map;

@Service
public class GoogleTokenVerifier {

    private static final Logger logger = LoggerFactory.getLogger(GoogleTokenVerifier.class);
    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${google.client.id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    public Map<String, Object> verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                Payload payload = idToken.getPayload();

                // Get profile information from payload
                String email = payload.getEmail();
                boolean emailVerified = payload.getEmailVerified();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");
                String locale = (String) payload.get("locale");
                String familyName = (String) payload.get("family_name");
                String givenName = (String) payload.get("given_name");

                logger.info("User authenticated: {}", email);

                return Map.of(
                        "email", email,
                        "emailVerified", emailVerified,
                        "name", name != null ? name : "",
                        "pictureUrl", pictureUrl != null ? pictureUrl : "",
                        "locale", locale != null ? locale : "",
                        "familyName", familyName != null ? familyName : "",
                        "givenName", givenName != null ? givenName : "",
                        "userId", payload.getSubject()
                );
            }
        } catch (GeneralSecurityException | IOException e) {
            logger.error("Error verifying Google token", e);
        }
        return null;
    }
}
