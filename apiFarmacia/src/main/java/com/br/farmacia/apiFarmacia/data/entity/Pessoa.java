package com.br.farmacia.apiFarmacia.data.entity;
import com.br.farmacia.apiFarmacia.data.dto.request.PessoaRequestDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CPF;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "pessoa")
public class Pessoa implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPessoa;

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

    @Column (name = "tipo_usuario")
    private UserRole tipoUsuario;

    @Builder
    public Pessoa(PessoaRequestDTO pessoaRequestDTO){
        this.nome = pessoaRequestDTO.nome();
        this.cpf = pessoaRequestDTO.cpf();
        this.telefone = pessoaRequestDTO.telefone();
        this.email = pessoaRequestDTO.email();
        this.senha = pessoaRequestDTO.senha();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
