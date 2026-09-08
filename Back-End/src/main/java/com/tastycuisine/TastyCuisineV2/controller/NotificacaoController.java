package com.tastycuisine.TastyCuisineV2.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tastycuisine.TastyCuisineV2.model.dto.NotificacaoRequestDTO;
import com.tastycuisine.TastyCuisineV2.model.entity.Notificacao;
import com.tastycuisine.TastyCuisineV2.model.service.NotificacaoService;

@RestController
@RequestMapping("/notificacoes")
@CrossOrigin(origins = "*")
public class NotificacaoController {

    @Autowired
    private NotificacaoService notificacaoService;

    // Endpoint para o Admin registrar o bloqueio e notificar
    @PostMapping("/bloquear")
    public ResponseEntity<Object> registrarBloqueio(@RequestBody NotificacaoRequestDTO dto) {
        try {
            Notificacao salva = notificacaoService.criarNotificacaoEBloquear(dto);
            return ResponseEntity.ok(salva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Endpoint para o Usuário/Chefe consultar o motivo do seu bloqueio
    @GetMapping("/usuario/{codUser}")
    public ResponseEntity<Object> buscarNotificacaoUsuario(@PathVariable Long codUser) {
        return notificacaoService.buscarUltimaNotificacaoUsuario(codUser)
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint para o Usuário enviar uma contestação
    @PostMapping("/{codNotificacao}/contestar")
    public ResponseEntity<Object> contestarBloqueio(@PathVariable Long codNotificacao, @RequestBody Map<String, String> payload) {
        try {
            String resposta = payload.get("resposta");
            Notificacao atualizada = notificacaoService.enviarContestacao(codNotificacao, resposta);
            return ResponseEntity.ok(atualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}