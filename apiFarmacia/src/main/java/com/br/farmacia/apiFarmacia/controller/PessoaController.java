package com.br.farmacia.apiFarmacia.controller;

import com.br.farmacia.apiFarmacia.data.dto.request.ChangePasswordRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.request.PessoaRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.PessoaResponseDTO;
import com.br.farmacia.apiFarmacia.service.PessoaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/pessoa")
public class PessoaController {

    @Autowired
    private PessoaService pessoaService;

    @GetMapping("/all")
    public ResponseEntity<List<PessoaResponseDTO>> getAllPessoas() {
        return ResponseEntity.status(HttpStatus.OK).body(pessoaService.getAllPessoas());
    }

    @GetMapping("/{idPessoa}")
    public ResponseEntity<PessoaResponseDTO> getPessoaById(@PathVariable Long idPessoa) {
        return ResponseEntity.status(HttpStatus.OK).body(pessoaService.getPessoaById(idPessoa));
    }

    @PostMapping("/create")
    public ResponseEntity<PessoaResponseDTO> createPessoa(@RequestBody @Valid PessoaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pessoaService.createPessoa(dto));
    }

    @PutMapping("/update/{idPessoa}")
    public ResponseEntity<PessoaResponseDTO> updatePessoa(@PathVariable Long idPessoa, @RequestBody @Valid PessoaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.OK).body(pessoaService.updatePessoa(idPessoa, dto));
    }

    @DeleteMapping("/delete/{idPessoa}")
    public ResponseEntity<String> deletePessoa(@PathVariable Long idPessoa) {
        return ResponseEntity.status(HttpStatus.OK).body(pessoaService.deletePessoa(idPessoa));
    }

    @PutMapping("/changePassword")
    public ResponseEntity<String> changePassword(@RequestBody @Valid ChangePasswordRequestDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        pessoaService.alterarSenhaViaToken(email, dto);

        return ResponseEntity.status(HttpStatus.OK).body("Senha alterada com sucesso.");
    }
}