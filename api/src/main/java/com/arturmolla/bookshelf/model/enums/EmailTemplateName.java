package com.arturmolla.bookshelf.model.enums;

import lombok.Getter;

@Getter
public enum EmailTemplateName {
    ACTIVATE_ACCOUNT("activate_account"),
    WELCOME_MESSAGE("welcome_message");

    private final String name;

    EmailTemplateName(String name) {
        this.name = name;
    }
}
