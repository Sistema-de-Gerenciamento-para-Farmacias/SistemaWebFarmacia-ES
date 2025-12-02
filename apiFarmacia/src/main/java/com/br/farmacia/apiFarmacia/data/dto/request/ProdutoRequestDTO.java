package com.br.farmacia.apiFarmacia.data.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Date;

public record ProdutoRequestDTO(

        @NotBlank(message = "O nome do produto é obrigatório")
        @Size(max = 100, message = "O nome não pode exceder 100 caracteres")
        String nome,

        @NotNull(message = "O preço de venda é obrigatório")
        @DecimalMin(value = "0.01", message = "O preço deve ser maior que zero")
        Double preco,

        @NotBlank(message = "A descrição do produto é obrigatória")
        @Size(max = 255, message = "A descrição não pode exceder 255 caracteres")
        String descricao,

        String linkImagem,

        @NotNull(message = "A data de validade é obrigatória")
        @FutureOrPresent(message = "A data de validade deve ser hoje ou futura")
        Date dataValidade,

        @NotBlank(message = "O fabricante é obrigatório")
        String fabricante
) {
}