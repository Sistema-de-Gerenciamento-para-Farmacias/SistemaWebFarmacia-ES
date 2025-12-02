package com.br.farmacia.apiFarmacia.data.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ItensVendaRequestDTO(

        @NotNull(message = "O ID do produto é obrigatório")
        Long idProduto,

        @NotNull(message = "A quantidade é obrigatória")
        @Positive(message = "A quantidade deve ser maior que zero")
        Integer quantidade
) {
}