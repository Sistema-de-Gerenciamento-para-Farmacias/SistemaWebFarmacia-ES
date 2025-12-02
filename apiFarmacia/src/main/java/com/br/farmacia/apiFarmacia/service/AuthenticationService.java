package com.br.farmacia.apiFarmacia.service;

import com.br.farmacia.apiFarmacia.controller.AuthenticationController;
import com.br.farmacia.apiFarmacia.data.dto.request.PessoaRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.PessoaResponseDTO;
import com.br.farmacia.apiFarmacia.data.entity.Pessoa;
import com.br.farmacia.apiFarmacia.data.entity.UserRole;
import com.br.farmacia.apiFarmacia.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private final JwtService jwtService;

    @Autowired
    PessoaRepository pessoaRepository;

    @Autowired
    BCryptPasswordEncoder bCryptPasswordEncoder;

    public AuthenticationService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public PessoaResponseDTO register(PessoaRequestDTO pessoaRequestDTO) {

        Pessoa pessoa = new Pessoa(pessoaRequestDTO);

        String encryptedSenha = bCryptPasswordEncoder.encode(pessoaRequestDTO.senha());
        pessoa.setSenha(encryptedSenha);

        pessoa.setTipoUsuario(UserRole.USER);

        pessoaRepository.save(pessoa);

        return new PessoaResponseDTO(pessoa);
    }

}
