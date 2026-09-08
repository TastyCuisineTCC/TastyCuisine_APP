package com.tastycuisine.TastyCuisineV2.model.service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.tastycuisine.TastyCuisineV2.model.entity.Usuario;
import com.tastycuisine.TastyCuisineV2.model.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Listar todos os usuários
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    // Salvar usuario
    public Usuario save(Usuario usuario) {
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return usuarioRepository.save(usuario);
    }

    // Listar usuario por Id
    public Usuario findById(long codUser) {
        return usuarioRepository.findById(codUser)
                .orElseThrow(() -> new RuntimeException("Usuario não encontrado com o código " + codUser));
    }

    public Usuario atualizarFoto(Long codUser, String link) {
        Usuario usuario = usuarioRepository.findById(codUser)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + codUser));
        usuario.setFotoPerfil(link);
        return usuarioRepository.save(usuario);
    }

    // atualizar usuario
    public Usuario update(long codUser, Usuario usuario) {
        Usuario usuarioExistente = findById(codUser);
        if (usuario.getNome_completo() != null && !usuario.getNome_completo().isBlank()) {
            usuarioExistente.setNome_completo(usuario.getNome_completo());
        }
        if (usuario.getGmail() != null && !usuario.getGmail().isBlank()) {
            usuarioExistente.setGmail(usuario.getGmail());
        }

        LocalDate hoje = LocalDate.now(); // pega o dia de hoje
        Period periodo = Period.between(usuario.getIdade(), hoje); // compara a data de nascimento
        int idade = periodo.getYears(); // pega os anos
        if (idade >= 14) {
            usuarioExistente.setIdade(usuario.getIdade());
        }

        if (usuario.getSenha() != null && !usuario.getSenha().isBlank()) {
            usuarioExistente.setSenha(passwordEncoder.encode(usuario.getSenha()));
        }
        if (usuario.getRestricoesAlimentares() != null) {
            usuarioExistente.setRestricoesAlimentares(usuario.getRestricoesAlimentares());
        }

        if (usuario.getFotoPerfil() != null) {
            usuarioExistente.setFotoPerfil(usuario.getFotoPerfil());
        }
        System.out.println("do negocio la: " + usuario.getFotoPerfil());
        return usuarioRepository.save(usuarioExistente);
    }

    // desativar usuario (delete lógico)
    public void delete(Long codUser) {
        Usuario usuarioExistente = findById(codUser);
        usuarioExistente.setStatus_Usuario("INATIVO");
        usuarioRepository.save(usuarioExistente);
    }

    // alterar status do usuario (banir/reativar)
    public Usuario ativate(Long codUser) {
        Usuario usuarioExistente = findById(codUser);
        usuarioExistente.setStatus_Usuario("ATIVO");
        return usuarioRepository.save(usuarioExistente);
    }

    public Usuario GetAdm() {
        List<Usuario> usuarios = findAll();
        Usuario usuario = usuarios.stream()
                .filter(u -> u.getFuncao().equals("ADMIN"))
                .findFirst()
                .orElse(null);
        return usuario;
    }

    // login de usuario
    public Usuario login(String gmail, String senha) {
        Usuario usuario = usuarioRepository.findByGmail(gmail)
                .orElseThrow(() -> new RuntimeException("Email Incorreto"));

        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new RuntimeException("Senha Incorreta");
        }

        if ("INATIVO".equals(usuario.getStatus_Usuario())) {
            throw new RuntimeException("CONTA_INATIVA");
        }
        return usuario;
    }

    // reativar conta com senha
    public Usuario reativar(String gmail, String senha) {
        Usuario usuario = usuarioRepository.findByGmail(gmail)
                .orElseThrow(() -> new RuntimeException("Email Incorreto"));

        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new RuntimeException("Senha Incorreta");
        }

        usuario.setStatus_Usuario("ATIVO"); // faltava isso!
        return usuarioRepository.save(usuario); // e isso!
    }

    public Usuario bloquear(Long codUser) {
        Usuario existente = findById(codUser);
        if (existente.getBloqueado() == 1) {
            existente.setBloqueado((byte) 0);
        } else
            existente.setBloqueado((byte) 1);
        return usuarioRepository.save(existente);
    }

    public Usuario SetBloqueado(Long codUser, byte Stat) {
        Usuario existente = findById(codUser);
         existente.setBloqueado(Stat);
        return usuarioRepository.save(existente);
    }
}