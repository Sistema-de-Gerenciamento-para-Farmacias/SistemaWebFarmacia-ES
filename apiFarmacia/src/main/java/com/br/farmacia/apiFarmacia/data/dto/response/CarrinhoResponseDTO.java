package com.br.farmacia.apiFarmacia.data.dto.response;

import com.br.farmacia.apiFarmacia.data.entity.Carrinho;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

public record CarrinhoResponseDTO(
        Long idCarrinho,
        Long idUsuario,
        String nomeUsuario,
        LocalDate dataCriacao,
        Double valorTotalCarrinho,
        List<ItemCarrinhoResponseDTO> itens
) {
    public CarrinhoResponseDTO(Carrinho carrinho) {
        this(
                carrinho.getIdCarrinho(),
                carrinho.getUsuario().getIdPessoa(),
                carrinho.getUsuario().getNome(),
                carrinho.getDataCriacao(),
                carrinho.getItens().stream()
                        .mapToDouble(i -> i.getProduto().getPreco() * i.getQuantidade())
                        .sum(),
                carrinho.getItens().stream()
                        .map(ItemCarrinhoResponseDTO::new)
                        .collect(Collectors.toList())
        );
    }
}