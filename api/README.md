# Secure Properties Management

## Environment Variables

Set the following environment variables before running the application:

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET_KEY=your-jwt-secret-key-minimum-32-chars
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

## External Configuration

You can also use external configuration files. Create a `config` directory at the project root and add your configuration:

1. Copy `config/application-example.yml` to `config/application-dev.yml`
2. Fill in your secure properties
3. Run the application with:
   ```
   CONFIG_LOCATION=./config/ ./mvnw spring-boot:run
   ```

## Property Encryption

For encrypted properties:

1. Set the encryption password as an environment variable:
   ```
   export JASYPT_ENCRYPTOR_PASSWORD=your-secure-password
   ```

2. Encrypt a value using the jasypt CLI tool:
   ```
   ./mvnw jasypt:encrypt-value -Djasypt.encryptor.password=your-secure-password -Djasypt.plugin.value=valueToEncrypt
   ```

3. Use the encrypted value in configuration:
   ```yaml
   sensitive.property: ENC(encrypted-value-output-from-jasypt)
   ```

## Production Best Practices

1. **Vault/Secret Manager**: Use HashiCorp Vault or cloud provider secret managers
2. **CI/CD**: Inject secrets during deployment, never store in repositories
3. **Rotation**: Implement regular secret rotation
4. **Auditing**: Log and monitor access to sensitive configurations
