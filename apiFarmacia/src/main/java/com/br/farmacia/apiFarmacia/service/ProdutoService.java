package com.br.farmacia.apiFarmacia.service;

import com.br.farmacia.apiFarmacia.data.dto.request.ProdutoRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.ProdutoResponseDTO;
import com.br.farmacia.apiFarmacia.data.entity.Produto;
import com.br.farmacia.apiFarmacia.repository.ProdutoRepository; // Assumindo que este repositório existe
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository; // Injeção do repositório de Produto

    public List<ProdutoResponseDTO> getAllProdutos() {
        List<Produto> produtos = produtoRepository.findAll();
        return produtos.stream().map(ProdutoResponseDTO::new).collect(Collectors.toList());
    }

    public ProdutoResponseDTO getProdutoById(Long idProduto) {
        Produto produto = getProdutoEntityById(idProduto);

        return new ProdutoResponseDTO(produto);
    }

    public ProdutoResponseDTO createProduto(ProdutoRequestDTO produtoRequestDTO) {
        Produto produto = new Produto(produtoRequestDTO);

        produtoRepository.save(produto);

        return new ProdutoResponseDTO(produto);
    }

    public ProdutoResponseDTO updateProduto(Long idProduto, ProdutoRequestDTO produtoRequestDTO) {
        Produto produto = getProdutoEntityById(idProduto);

        produto.setNome(produtoRequestDTO.nome());
        produto.setPreco(produtoRequestDTO.preco());
        produto.setDescricao(produtoRequestDTO.descricao());
        produto.setLinkImagem(produtoRequestDTO.linkImagem());
        produto.setDataValidade(produtoRequestDTO.dataValidade());
        produto.setFabricante(produtoRequestDTO.fabricante());

        produtoRepository.save(produto);

        return new ProdutoResponseDTO(produto);
    }

    public String deleteProduto(Long idProduto) {
        Produto produto = getProdutoEntityById(idProduto);

        produto.setDataExclusao(LocalDate.now());
        produtoRepository.save(produto);

        return "Produto Id: " + "deletada com sucesso!";
    }

    private Produto getProdutoEntityById(Long idProduto){
        return produtoRepository.findById(idProduto).orElseThrow(() -> new RuntimeException("Produto não encontrado com Id: " + idProduto));
    }
}