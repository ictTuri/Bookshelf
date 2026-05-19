package com.arturmolla.bookshelf.model.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DtoFriendInfo {
    private Long id;
    private String fullName;
    private String email;
    private byte[] profilePic;
}
