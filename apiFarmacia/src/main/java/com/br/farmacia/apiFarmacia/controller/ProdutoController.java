package com.br.farmacia.apiFarmacia.controller;

import com.br.farmacia.apiFarmacia.data.dto.request.ProdutoRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.ProdutoResponseDTO;
import com.br.farmacia.apiFarmacia.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/produto")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @GetMapping("/all")
    public ResponseEntity<List<ProdutoResponseDTO>> getAllProdutos() {
        return ResponseEntity.status(HttpStatus.OK).body(produtoService.getAllProdutos());
    }

    @GetMapping("/{idProduto}")
    public ResponseEntity<ProdutoResponseDTO> getProdutoById(@PathVariable Long idProduto) {
        return ResponseEntity.status(HttpStatus.OK).body(produtoService.getProdutoById(idProduto));
    }

    @PostMapping("/create")
    public ResponseEntity<ProdutoResponseDTO> createProduto(@RequestBody @Valid ProdutoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.createProduto(dto));
    }

    @PutMapping("/update/{idProduto}")
    public ResponseEntity<ProdutoResponseDTO> updateProduto(
            @PathVariable Long idProduto,
            @RequestBody @Valid ProdutoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.OK).body(produtoService.updateProduto(idProduto, dto));
    }

    @DeleteMapping("/delete/{idProduto}")
    public ResponseEntity<String> deleteProduto(@PathVariable Long idProduto) {
        return ResponseEntity.status(HttpStatus.OK).body(produtoService.deleteProduto(idProduto));
    }
}