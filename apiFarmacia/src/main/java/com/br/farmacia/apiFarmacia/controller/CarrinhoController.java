package com.br.farmacia.apiFarmacia.controller;

import com.br.farmacia.apiFarmacia.data.dto.request.ItemCarrinhoRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.CarrinhoResponseDTO;
import com.br.farmacia.apiFarmacia.data.entity.Pessoa;
import com.br.farmacia.apiFarmacia.exceptions.general.EntityNotFoundException;
import com.br.farmacia.apiFarmacia.repository.PessoaRepository;
import com.br.farmacia.apiFarmacia.service.CarrinhoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carrinho")
public class CarrinhoController {

    @Autowired
    private CarrinhoService carrinhoService;

    @Autowired
    private PessoaRepository pessoaRepository;

    private Long getUsuarioLogadoId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Pessoa pessoa = pessoaRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário logado não encontrado no banco de dados."));

        return pessoa.getIdPessoa();
    }

    @GetMapping("/all")
    public ResponseEntity<CarrinhoResponseDTO> getCarrinho() {
        Long idUsuario = getUsuarioLogadoId();
        return ResponseEntity.status(HttpStatus.OK).body(carrinhoService.getCarrinhoByUsuario(idUsuario));
    }

    @PostMapping("/adicionar")
    public ResponseEntity<CarrinhoResponseDTO> adicionarItem(@RequestBody @Valid ItemCarrinhoRequestDTO dto) {
        Long idUsuario = getUsuarioLogadoId();
        return ResponseEntity.status(HttpStatus.CREATED).body(carrinhoService.adicionarItem(idUsuario, dto));
    }

    @DeleteMapping("/remover/{idItemCarrinho}")
    public ResponseEntity<String> removerItem(@PathVariable Long idItemCarrinho) {
        Long idUsuario = getUsuarioLogadoId();
        return ResponseEntity.status(HttpStatus.OK).body(carrinhoService.removerItem(idUsuario, idItemCarrinho));
    }

    @DeleteMapping("/limpar")
    public ResponseEntity<String> limparCarrinho() {
        Long idUsuario = getUsuarioLogadoId();
        return ResponseEntity.status(HttpStatus.OK).body(carrinhoService.limparCarrinho(idUsuario));
    }
}