package com.arturmolla.bookshelf.api.config;

import com.google.api.client.util.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class ConfigWebClient {

    @Value("${spring.security.oauth2.resourceserver.opaque-token.introspect-uri}")
    private String introspectUri;

    @Bean
    public WebClient userInfoClient() {
        return WebClient.builder().baseUrl(introspectUri).build();
    }
}
