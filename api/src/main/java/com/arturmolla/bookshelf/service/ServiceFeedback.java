package com.arturmolla.bookshelf.service;

import com.arturmolla.bookshelf.config.exceptions.OperationNotPermittedException;
import com.arturmolla.bookshelf.model.common.PageResponse;
import com.arturmolla.bookshelf.model.dto.DtoFeedbackRequest;
import com.arturmolla.bookshelf.model.dto.DtoFeedbackResponse;
import com.arturmolla.bookshelf.model.entity.EntityFeedback;
import com.arturmolla.bookshelf.model.user.User;
import com.arturmolla.bookshelf.repository.RepositoryBook;
import com.arturmolla.bookshelf.repository.RepositoryFeedback;
import com.arturmolla.bookshelf.service.mapper.MapperFeedback;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ServiceFeedback {

    private final RepositoryBook repositoryBook;
    private final MapperFeedback mapperFeedback;
    private final RepositoryFeedback repositoryFeedback;

    public Long saveFeedback(DtoFeedbackRequest request, Authentication connectedUser) {
        var book = repositoryBook.findById(request.bookId())
                .orElseThrow(() -> new EntityNotFoundException("Book was not found"));
        if (book.getArchived() || !book.getShareable()) {
            throw new OperationNotPermittedException("You can not give feedback for archived/non-shareable book!");
        }
        var user = (User) connectedUser.getPrincipal();
        if (!Objects.equals(book.getOwner().getId(), user.getId())) {
            throw new OperationNotPermittedException("You own this book!");
        }
        var feedback = mapperFeedback.toFeedbackEntity(request);
        return repositoryFeedback.save(feedback).getId();
    }

    public PageResponse<DtoFeedbackResponse> findFeedbacksForBook(Long bookId, int page, int size, Authentication connectedUser) {
        Pageable pageable = PageRequest.of(page, size);
        var user = (User) connectedUser.getPrincipal();
        Page<EntityFeedback> feedbacks = repositoryFeedback.findAllByBookId()
    }
}
