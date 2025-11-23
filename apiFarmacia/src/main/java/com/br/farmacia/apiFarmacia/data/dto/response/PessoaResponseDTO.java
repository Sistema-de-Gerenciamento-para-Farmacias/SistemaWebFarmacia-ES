package com.br.farmacia.apiFarmacia.data.dto.response;

import com.br.farmacia.apiFarmacia.data.entity.Pessoa;

public record PessoaResponseDTO(

        Long id,

        String nome,

        String cpf,

        String telefone,

        String email,

        String senha
) {
    public PessoaResponseDTO(Pessoa pessoa){
        this(pessoa.getIdPessoa(),pessoa.getNome(),pessoa.getCpf(), pessoa.getTelefone(), pessoa.getEmail(),pessoa.getSenha());
    }
}
