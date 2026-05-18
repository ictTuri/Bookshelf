package com.arturmolla.bookshelf.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;

@Component
@Slf4j
public class EncryptionUtil {

    @Value("${app.encryption.secret-key}")
    private String secretKey;

    private SecretKeySpec secretKeySpec;

    private void setKey(String mySecretKey) {
        try {
            byte[] key = mySecretKey.getBytes(StandardCharsets.UTF_8);
            MessageDigest sha = MessageDigest.getInstance("SHA-1");
            key = sha.digest(key);
            key = Arrays.copyOf(key, 16); // Use only first 128 bit
            secretKeySpec = new SecretKeySpec(key, "AES");
        } catch (Exception e) {
            log.error("Error while setting encryption key", e);
        }
    }

    public String encrypt(String strToEncrypt) {
        try {
            setKey(secretKey);
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
            return Base64.getEncoder().encodeToString(cipher.doFinal(strToEncrypt.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            log.error("Error while encrypting string", e);
        }
        return null;
    }

    public String decrypt(String strToDecrypt) {
        try {
            setKey(secretKey);
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
            return new String(cipher.doFinal(Base64.getDecoder().decode(strToDecrypt)));
        } catch (Exception e) {
            log.error("Error while decrypting string", e);
        }
        return null;
    }
}
