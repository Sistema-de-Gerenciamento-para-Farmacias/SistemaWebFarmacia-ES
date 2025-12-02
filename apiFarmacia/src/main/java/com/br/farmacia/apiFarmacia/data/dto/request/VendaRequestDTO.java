package com.br.farmacia.apiFarmacia.data.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record VendaRequestDTO(
        @NotNull(message = "Informe o ID do usuário")
        Long idUsuario,

        @NotNull(message = "A venda precisa ter itens")
        @Size(min = 1, message = "Adicione pelo menos um produto")
        List<ItensVendaRequestDTO> itens
) {
}