package com.br.farmacia.apiFarmacia.data.dto.response;

import com.br.farmacia.apiFarmacia.data.entity.Venda;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

public record VendaResponseDTO(
        Long idVenda,
        PessoaResponseDTO usuario,
        LocalDate dataCompra,
        LocalDate dataExclusao,
        List<ItemVendaResponseDTO> itens
) {
    public VendaResponseDTO(Venda venda){
        this(
                venda.getIdVenda(),
                new PessoaResponseDTO(venda.getIdUsuario()),
                venda.getDataCompra(),
                venda.getDataExclusao(),
                venda.getItens() != null ?
                        venda.getItens().stream().map(ItemVendaResponseDTO::new).collect(Collectors.toList()) : List.of()
        );
    }
}