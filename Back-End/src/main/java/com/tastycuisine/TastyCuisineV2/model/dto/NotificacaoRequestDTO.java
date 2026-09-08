package com.tastycuisine.TastyCuisineV2.model.dto;

public class NotificacaoRequestDTO {
    private Long targetId;        // ID do usuário ou da receita
    private String tipoEntidade;  // 'USUARIO', 'CHEFE' ou 'RECEITA'
    private String motivo;
    private String descricao;

    // Getters e Setters
    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }

    public String getTipoEntidade() { return tipoEntidade; }
    public void setTipoEntidade(String tipoEntidade) { this.tipoEntidade = tipoEntidade; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}