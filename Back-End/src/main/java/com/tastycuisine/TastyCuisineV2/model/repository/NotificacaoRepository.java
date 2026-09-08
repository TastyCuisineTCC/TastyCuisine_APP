package com.tastycuisine.TastyCuisineV2.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tastycuisine.TastyCuisineV2.model.entity.Notificacao;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    // Busca a notificação pendente mais recente de um usuário/chefe
    Optional<Notificacao> findFirstByUsuarioCodUserOrderByDataEnvioDesc(Long codUser);

    // Busca as notificações de receitas de um determinado chefe/usuário
    List<Notificacao> findByReceitaUsuarioCodUser(Long codUser);
    
    // Busca notificação de uma receita específica
    Optional<Notificacao> findFirstByReceitaCodReceitasOrderByDataEnvioDesc(Long codReceitas);
}