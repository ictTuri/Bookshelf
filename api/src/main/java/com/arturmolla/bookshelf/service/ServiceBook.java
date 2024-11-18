package com.arturmolla.bookshelf.service;

import com.arturmolla.bookshelf.config.exceptions.OperationNotPermittedException;
import com.arturmolla.bookshelf.model.common.PageResponse;
import com.arturmolla.bookshelf.model.dto.DtoBookRequest;
import com.arturmolla.bookshelf.model.dto.DtoBookResponse;
import com.arturmolla.bookshelf.model.dto.DtoBorrowedBooksResponse;
import com.arturmolla.bookshelf.model.entity.EntityBook;
import com.arturmolla.bookshelf.model.entity.EntityBookTransactionHistory;
import com.arturmolla.bookshelf.model.user.User;
import com.arturmolla.bookshelf.repository.RepositoryBook;
import com.arturmolla.bookshelf.repository.RepositoryBookTransactionHistory;
import com.arturmolla.bookshelf.repository.specification.SpecificationBook;
import com.arturmolla.bookshelf.service.mapper.MapperBook;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceBook {

    public static final String BOOK_NOT_FOUND = "Book was not found with id: ";
    private final RepositoryBook repositoryBook;
    private final RepositoryBookTransactionHistory repositoryBookTransactionHistory;
    private final MapperBook mapperBook;

    public Long saveBook(DtoBookRequest request, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        EntityBook book = mapperBook.toEntityBook(request);
        book.setOwner(user);
        return repositoryBook.save(book).getId();
    }

    public DtoBookResponse findBookById(Long bookId) {
        return repositoryBook.findById(bookId)
                .map(mapperBook::toDtoBookResponse)
                .orElseThrow(() -> new EntityNotFoundException(BOOK_NOT_FOUND + bookId));
    }

    public PageResponse<DtoBookResponse> getAllBooksPaged(int page, int size, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<EntityBook> books = repositoryBook.findAllDisplayableBooks(pageable, user.getId());
        return mapPageToCustomWrapper(books);
    }

    public PageResponse<DtoBookResponse> getAllBooksByOwner(int page, int size, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<EntityBook> books = repositoryBook.findAll(SpecificationBook.withOwnerId(user.getId()), pageable);
        return mapPageToCustomWrapper(books);
    }

    public PageResponse<DtoBorrowedBooksResponse> getAllBorrowedBooks(int page, int size, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<EntityBookTransactionHistory> allBorrowedBooks = repositoryBookTransactionHistory.findAllBorrowedBooks(
                pageable, user.getId()
        );
        return mapPageToCustomWrapperHistories(allBorrowedBooks);
    }

    public PageResponse<DtoBorrowedBooksResponse> getAllReturnedBooks(int page, int size, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<EntityBookTransactionHistory> allBorrowedBooks = repositoryBookTransactionHistory.findAllReturnedBooks(
                pageable, user.getId()
        );
        return mapPageToCustomWrapperHistories(allBorrowedBooks);
    }

    public Long updateShareableStatus(Long bookId, Authentication connectedUser) {
        var book = repositoryBook.findById(bookId)
                .orElseThrow(() -> new EntityNotFoundException(BOOK_NOT_FOUND + bookId));
        User user = (User) connectedUser.getPrincipal();
        if (!Objects.equals(book.getOwner().getId(), user.getId())) {
            throw new OperationNotPermittedException("You can not perform this action!");
        }
        book.setShareable(!book.getShareable());
        repositoryBook.save(book);
        return book.getId();
    }

    // HELPER METHODS

    private PageResponse<DtoBorrowedBooksResponse> mapPageToCustomWrapperHistories(Page<EntityBookTransactionHistory> allBorrowedBooks) {
        List<DtoBorrowedBooksResponse> borrowedBooksResponses = allBorrowedBooks.stream()
                .map(mapperBook::toDtoBorrowedBookResponse)
                .toList();
        return new PageResponse<>(
                borrowedBooksResponses,
                allBorrowedBooks.getNumber(),
                allBorrowedBooks.getSize(),
                allBorrowedBooks.getTotalElements(),
                allBorrowedBooks.getTotalPages(),
                allBorrowedBooks.isFirst(),
                allBorrowedBooks.isLast()
        );
    }

    private PageResponse<DtoBookResponse> mapPageToCustomWrapper(Page<EntityBook> books) {
        List<DtoBookResponse> bookResponses = books.stream()
                .map(mapperBook::toDtoBookResponse)
                .toList();
        return new PageResponse<>(
                bookResponses,
                books.getNumber(),
                books.getSize(),
                books.getTotalElements(),
                books.getTotalPages(),
                books.isFirst(),
                books.isLast()
        );
    }
}
