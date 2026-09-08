package com.tastycuisine.TastyCuisineV2.model.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;

import com.tastycuisine.TastyCuisineV2.model.dto.NotificacaoRequestDTO;
import com.tastycuisine.TastyCuisineV2.model.entity.Notificacao;
import com.tastycuisine.TastyCuisineV2.model.entity.Receita;
import com.tastycuisine.TastyCuisineV2.model.entity.Usuario;
import com.tastycuisine.TastyCuisineV2.model.repository.NotificacaoRepository;
import com.tastycuisine.TastyCuisineV2.model.repository.ReceitaRepository;
import com.tastycuisine.TastyCuisineV2.model.repository.UsuarioRepository;

@Service
public class NotificacaoService {

    @Autowired
    private NotificacaoRepository notificacaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ReceitaRepository receitaRepository;

    @Transactional
    public Notificacao criarNotificacaoEBloquear(NotificacaoRequestDTO dto) {
        Notificacao notificacao = new Notificacao();
        notificacao.setTipoEntidade(dto.getTipoEntidade().toUpperCase());
        notificacao.setMotivo(dto.getMotivo());
        notificacao.setDescricao(dto.getDescricao());

        String tipo = dto.getTipoEntidade().toUpperCase();

        if ("USUARIO".equals(tipo) || "CHEFE".equals(tipo)) {
            Usuario usuario = usuarioRepository.findById(dto.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Usuário/Chefe não encontrado com o ID: " + dto.getTargetId()));
            
            // Alterna/Define o bloqueio do usuário (1 para bloqueado)
            usuario.setBloqueado((byte)1);
            usuarioRepository.save(usuario);

            notificacao.setUsuario(usuario);

        } else if ("RECEITA".equals(tipo)) {
            Receita receita = receitaRepository.findById(dto.getTargetId())
                    .orElseThrow(() -> new RuntimeException("Receita não encontrada com o ID: " + dto.getTargetId()));

            // Define o status da receita para INATIVO
            receita.setStatus_receita("INATIVO");
            receitaRepository.save(receita);

            notificacao.setReceita(receita);
            notificacao.setUsuario(receita.getUsuario()); // Vincula também o dono da receita
        } else {
            throw new IllegalArgumentException("Tipo de entidade inválido: " + dto.getTipoEntidade());
        }

        return notificacaoRepository.save(notificacao);
    }

    public Optional<Notificacao> buscarUltimaNotificacaoUsuario(Long codUser) {
        return notificacaoRepository.findFirstByUsuarioCodUserOrderByDataEnvioDesc(codUser);
    }

    @Transactional
    public Notificacao enviarContestacao(Long codNotificacao, String resposta) {
        Notificacao notificacao = notificacaoRepository.findById(codNotificacao)
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada com o ID: " + codNotificacao));

        notificacao.setRespostaUsuario(resposta);
        notificacao.setStatusNotificacao("EM_ANALISE");

        return notificacaoRepository.save(notificacao);
    }

    @GetMapping
    public List<Notificacao> getAll(){
        return notificacaoRepository.findAll();
    }

    @GetMapping
    public Notificacao findById(Long codNotificacao){
        return notificacaoRepository.findById(codNotificacao).orElseThrow(() -> new RuntimeException("Livro não encontrado com o código " + codNotificacao));
    }

    @DeleteMapping
    public void Deletar(Long codNotificacao){
        Notificacao toDel = findById((codNotificacao));
        if(toDel != null){
            notificacaoRepository.delete(toDel);
        }
    }
}