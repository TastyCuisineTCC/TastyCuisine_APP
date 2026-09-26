package com.tastycuisine.TastyCuisineV2.model.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "Usuario")
@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Cod_user")
    private long codUser;

    @Builder.Default
    @Column(name = "Status_Usuario", length = 20, nullable = false)
    private String Status_Usuario = "ATIVO";

    @Builder.Default
    @Column(name = "Bloqueado", nullable = false)
    private boolean bloqueado = false;

    @Column(name = "nome_completo", length = 300, nullable = false)
    @NotBlank
    private String nome_completo;

    @Column(nullable = false)
    private LocalDate idade;

    @Column(length = 255, nullable = false, unique = true)
    @NotBlank
    private String gmail;

    @Column(length = 250, nullable = false)
    @NotBlank
    private String senha;

    @Column(name = "Restricoes_alimentares", columnDefinition = "TEXT")
    private String restricoesAlimentares;

    @Column(name = "foto_perfil", columnDefinition = "TEXT")
    private String fotoPerfil;

    @Column(name = "funcao", length = 30)
    private String funcao;

    public boolean getBloqueado() {return this.bloqueado;}
}
