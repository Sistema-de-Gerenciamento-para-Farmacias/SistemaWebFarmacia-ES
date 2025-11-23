package com.br.farmacia.apiFarmacia.data.dto.response;

import com.br.farmacia.apiFarmacia.data.entity.ItensVenda;
import java.math.BigDecimal;

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
                item.getProduto().getPreco(), // Pega o preço atual do produto
                item.getProduto().getPreco() * item.getQuantidade() // Calcula o total da linha
        );
    }
}