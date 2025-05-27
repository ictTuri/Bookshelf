package com.arturmolla.bookshelf.model.user;

import java.util.Map;

public class UserDetailsResponse {
    private String token;
    private Map<String, Object> user;

    public UserDetailsResponse(String token, Map<String, Object> user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Map<String, Object> getUser() {
        return user;
    }

    public void setUser(Map<String, Object> user) {
        this.user = user;
    }
}
