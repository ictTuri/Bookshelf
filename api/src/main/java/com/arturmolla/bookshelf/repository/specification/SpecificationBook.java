package com.arturmolla.bookshelf.repository.specification;

import com.arturmolla.bookshelf.model.entity.EntityBook;
import org.springframework.data.jpa.domain.Specification;

public class SpecificationBook {

    public static Specification<EntityBook> withOwnerId(Long ownerId) {
        return ((root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("owner").get("id"), ownerId));
    }
}
