package com.arturmolla.bookshelf.api.model.dto;

public record Userinfo(
        String sub,
        String name,
        String given_name,
        String family_name,
        String picture,
        String email,
        boolean email_verified,
        String locale
) {
}
