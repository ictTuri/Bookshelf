package com.arturmolla.bookshelf.config;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class SecurityPropertiesConfig implements InitializingBean {

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.secret}")
    private String googleClientSecret;

    @Value("${application.security.jwt.secret-key}")
    private String jwtSecretKey;

    @Override
    public void afterPropertiesSet() throws Exception {
        validateProperty("GOOGLE_CLIENT_ID", googleClientId);
        validateProperty("GOOGLE_CLIENT_SECRET", googleClientSecret);
        validateProperty("JWT_SECRET_KEY", jwtSecretKey);
    }

    private void validateProperty(String propertyName, String propertyValue) {
        if (!StringUtils.hasText(propertyValue) || 
            propertyValue.startsWith("${") ||
            propertyValue.equals("YOUR_" + propertyName)) {
            throw new IllegalStateException(
                "Security property '" + propertyName + "' is not configured correctly. " +
                "Please set it as an environment variable or in an external configuration file."
            );
        }
    }
}
