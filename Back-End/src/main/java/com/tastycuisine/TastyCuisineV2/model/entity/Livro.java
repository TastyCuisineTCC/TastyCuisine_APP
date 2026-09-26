package com.tastycuisine.TastyCuisineV2.model.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "Livros")
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Cod_Livros")
    private long codLivro;

    @Column(name = "Nome_Livro", length = 50, nullable = false)
    @NotBlank
    private String nomeLivro;

    @Builder.Default
    @ManyToMany
    @JoinTable(name = "Livro_Receitas", joinColumns = @JoinColumn(name = "Cod_Livros"), inverseJoinColumns = @JoinColumn(name = "Cod_Receita"))
    private List<Receita> receitas = new ArrayList<>();

    // Em Livro.java
    @Column(name = "Foto_Livro", columnDefinition = "TEXT")
    private String fotoLivro;

    @ManyToOne
    @JoinColumn(name = "Cod_User", nullable = false)
    private Usuario usuario;
}
