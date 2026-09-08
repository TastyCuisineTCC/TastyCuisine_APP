package com.tastycuisine.TastyCuisineV2.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Notificacoes")
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Cod_notificacao")
    private Long codNotificacao;

    @Column(name = "Tipo_Entidade", nullable = false)
    private String tipoEntidade; // 'USUARIO', 'CHEFE' ou 'RECEITA'

    @Column(name = "Motivo", nullable = false)
    private String motivo;

    @Column(name = "Descricao", nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "Resposta_Usuario", columnDefinition = "TEXT")
    private String respostaUsuario;

    @Column(name = "Data_Envio")
    private LocalDateTime dataEnvio = LocalDateTime.now();

    @Column(name = "Status_Notificacao")
    private String statusNotificacao = "PENDENTE";

    // Relacionamentos Opcionais
    @ManyToOne
    @JoinColumn(name = "Cod_user", nullable = true)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "Cod_receita", nullable = true)
    private Receita receita;

    public Notificacao() {}

    // Getters e Setters
    public Long getCodNotificacao() { return codNotificacao; }
    public void setCodNotificacao(Long codNotificacao) { this.codNotificacao = codNotificacao; }

    public String getTipoEntidade() { return tipoEntidade; }
    public void setTipoEntidade(String tipoEntidade) { this.tipoEntidade = tipoEntidade; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getRespostaUsuario() { return respostaUsuario; }
    public void setRespostaUsuario(String respostaUsuario) { this.respostaUsuario = respostaUsuario; }

    public LocalDateTime getDataEnvio() { return dataEnvio; }
    public void setDataEnvio(LocalDateTime dataEnvio) { this.dataEnvio = dataEnvio; }

    public String getStatusNotificacao() { return statusNotificacao; }
    public void setStatusNotificacao(String statusNotificacao) { this.statusNotificacao = statusNotificacao; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Receita getReceita() { return receita; }
    public void setReceita(Receita receita) { this.receita = receita; }
}