package com.br.farmacia.apiFarmacia.data.dto.response;

import com.br.farmacia.apiFarmacia.data.entity.ItensCarrinho;

public record ItemCarrinhoResponseDTO(
        Long idItemCarrinho,
        Long idProduto,
        String nomeProduto,
        Integer quantidade,
        Double precoUnitario,
        Double subTotal
) {
    public ItemCarrinhoResponseDTO(ItensCarrinho item) {
        this(
                item.getIdItemCarrinho(),
                item.getProduto().getIdProduto(),
                item.getProduto().getNome(),
                item.getQuantidade(),
                item.getProduto().getPreco(),
                item.getProduto().getPreco() * item.getQuantidade()
        );
    }
}