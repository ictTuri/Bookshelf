package com.arturmolla.bookshelf.api.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "book")
@AllArgsConstructor
@NoArgsConstructor
public class EntityBook {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "title")
    private String title;
    @Column(name = "short_description")
    private String shortDescription;
    @Column(name = "long_description")
    private String longDescription;
    @Column(name = "genre")
    private String genre;
    @Column(name = "favourite")
    private Boolean favourite = Boolean.FALSE;
    @Column(name = "page_bookmark")
    private Integer pageBookmark;
    @Column(name = "read")
    private Boolean read = Boolean.FALSE;
    @Column(name = "loaned")
    private Boolean loaned = Boolean.FALSE;
    @Column(name = "loaned_to")
    private String loaned_to;
    @Column(name = "deleted")
    private Boolean deleted = Boolean.FALSE;
    @Column(name = "to_buy")
    private Boolean toBuy = Boolean.FALSE;
}
