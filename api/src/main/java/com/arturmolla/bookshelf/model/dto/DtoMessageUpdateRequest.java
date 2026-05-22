package com.arturmolla.bookshelf.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DtoMessageUpdateRequest {
    private String content;
    private Map<String, String> reactions;
}
