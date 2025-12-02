package com.br.farmacia.apiFarmacia.data.dto.response;

import com.br.farmacia.apiFarmacia.data.entity.ItensVenda;

public record ItemVendaResponseDTO(
        Long idProduto,
        String nomeProduto,
        Integer quantidade,
        Double precoUnitario,
        Double subTotal
) {
    public ItemVendaResponseDTO(ItensVenda item) {
        this(
                item.getProduto().getIdProduto(),
                item.getProduto().getNome(),
                item.getQuantidade(),
                item.getProduto().getPreco(),
                item.getProduto().getPreco() * item.getQuantidade()
        );
    }
}