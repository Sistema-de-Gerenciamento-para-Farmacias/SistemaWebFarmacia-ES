package com.br.farmacia.apiFarmacia.data.dto.response;

import com.br.farmacia.apiFarmacia.data.entity.Produto;

import java.time.LocalDate;
import java.util.Date;

public record ProdutoResponseDTO(

        Long idProduto,

        String nome,

        Double preco,

        String descricao,

        String linkImagem,

        Date dataValidade,

        String fabricante,

        LocalDate dataExclusao
) {
    public ProdutoResponseDTO(Produto produto) {
        this(produto.getIdProduto(),produto.getNome(), produto.getPreco(), produto.getDescricao(), produto.getLinkImagem(), produto.getDataValidade(), produto.getFabricante(), produto.getDataExclusao());
    }
}