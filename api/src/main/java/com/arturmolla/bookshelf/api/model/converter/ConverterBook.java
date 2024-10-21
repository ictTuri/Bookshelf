package com.arturmolla.bookshelf.api.model.converter;

import com.arturmolla.bookshelf.api.model.entity.EntityBook;
import com.arturmolla.bookshelf.api.model.dto.DtoBook;

public class ConverterBook {

    private ConverterBook() {}

    public static DtoBook toDtoConverter(EntityBook entity) {
        var toReturn = new DtoBook();
        toReturn.setId(entity.getId());
        toReturn.setTitle(entity.getTitle());
        toReturn.setShortDescription(entity.getShortDescription());
        toReturn.setGenre(entity.getGenre());
        return toReturn;
    }
}
