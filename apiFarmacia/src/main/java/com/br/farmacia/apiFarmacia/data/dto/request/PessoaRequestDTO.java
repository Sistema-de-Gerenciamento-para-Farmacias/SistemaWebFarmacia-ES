package com.br.farmacia.apiFarmacia.data.dto.request;

import com.br.farmacia.apiFarmacia.data.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.br.CPF;

public record PessoaRequestDTO(

        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @CPF(message = "CPF inválido")
        @NotBlank(message = "O CPF é obrigatório")
        String cpf,

        String telefone,

        @Email(message = "O email deve ser um endereço válido")
        @NotBlank(message = "O email é obrigatório")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        String senha,

        UserRole tipoUsuario
) {
}