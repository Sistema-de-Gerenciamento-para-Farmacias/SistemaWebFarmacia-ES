package com.br.farmacia.apiFarmacia.data.dto.response;

import java.time.LocalDate;

import com.br.farmacia.apiFarmacia.data.entity.Pessoa;
import com.br.farmacia.apiFarmacia.data.entity.UserRole;

public record PessoaResponseDTO(

        Long id,

        String nome,

        String cpf,

        String telefone,

        String email,

        String senha,

        UserRole tipoUsuario,

        LocalDate dataExclusao
) {
    public PessoaResponseDTO(Pessoa pessoa){
        this(pessoa.getIdPessoa(),pessoa.getNome(),pessoa.getCpf(), pessoa.getTelefone(), pessoa.getEmail(),pessoa.getSenha(),pessoa.getTipoUsuario(),pessoa.getDataExclusao());
    }
}
