package com.br.farmacia.apiFarmacia.data.entity;
import com.br.farmacia.apiFarmacia.data.dto.request.PessoaRequestDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "pessoa")
public class Pessoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idpessoa;

    @Column (name = "nome", nullable = false)
    private String nome;

    @CPF
    @Column (name = "cpf", nullable = false)
    private String cpf;

    @Column (name = "telefone")
    private String telefone;

    @Email
    @Column (name = "email", nullable = false)
    private String email;

    @Column (name = "senha", nullable = false)
    private String senha;

    @Column(name = "data_exclusao")
    private LocalDate dataExclusao;

    @Builder
    public Pessoa(PessoaRequestDTO pessoaRequestDTO){
        this.nome = pessoaRequestDTO.nome();
        this.cpf = pessoaRequestDTO.cpf();
        this.telefone = pessoaRequestDTO.telefone();
        this.email = pessoaRequestDTO.email();
        this.senha = pessoaRequestDTO.senha();
    }
}
