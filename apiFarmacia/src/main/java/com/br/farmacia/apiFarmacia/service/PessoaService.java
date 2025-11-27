package com.br.farmacia.apiFarmacia.service;

import com.br.farmacia.apiFarmacia.data.dto.request.ChangePasswordRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.request.PessoaRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.PessoaResponseDTO;
import com.br.farmacia.apiFarmacia.data.entity.Pessoa;
import com.br.farmacia.apiFarmacia.exceptions.general.EntityNotFoundException;
import com.br.farmacia.apiFarmacia.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PessoaService {

    @Autowired
    private PessoaRepository pessoaRepository;

    private final BCryptPasswordEncoder passwordEncoder;

    public PessoaService(BCryptPasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public List<PessoaResponseDTO> getAllPessoas() {
        List<Pessoa> pessoas = pessoaRepository.findAll();
        return pessoas.stream().map(PessoaResponseDTO::new).collect(Collectors.toList());
    }

    public PessoaResponseDTO getPessoaById(Long idPessoa) {
        Pessoa pessoa = getPessoaEntityById(idPessoa);
        return new PessoaResponseDTO(pessoa);
    }

    public PessoaResponseDTO createPessoa(PessoaRequestDTO pessoaRequestDTO) {
        Pessoa pessoa = new Pessoa(pessoaRequestDTO);
        String encryptedSenha = passwordEncoder.encode(pessoaRequestDTO.senha());
        pessoa.setSenha(encryptedSenha);
        pessoa.setTipoUsuario(pessoaRequestDTO.tipoUsuario());
        pessoaRepository.save(pessoa);
        return new PessoaResponseDTO(pessoa);
    }

    public PessoaResponseDTO updatePessoa(Long idPessoa, PessoaRequestDTO pessoaRequestDTO) {
        Pessoa pessoa = getPessoaEntityById(idPessoa);

        pessoa.setNome(pessoaRequestDTO.nome());
        pessoa.setCpf(pessoaRequestDTO.cpf());
        pessoa.setTelefone(pessoaRequestDTO.telefone());
        pessoa.setEmail(pessoaRequestDTO.email());

        if (pessoaRequestDTO.senha() != null && !pessoaRequestDTO.senha().isEmpty()) {
            String encryptedSenha = passwordEncoder.encode(pessoaRequestDTO.senha());
            pessoa.setSenha(encryptedSenha);
        }

        pessoa.setTipoUsuario(pessoaRequestDTO.tipoUsuario());

        pessoaRepository.save(pessoa);

        return new PessoaResponseDTO(pessoa);
    }

    public String deletePessoa(Long idPessoa) {
        Pessoa pessoa = getPessoaEntityById(idPessoa);

        pessoa.setDataExclusao(LocalDate.now());
        pessoaRepository.save(pessoa);

        return "Pessoa Id: " + idPessoa +  "deletada com sucesso!";
    }

    @Transactional
    public void alterarSenhaViaToken(String email, ChangePasswordRequestDTO dto) {
        Pessoa pessoa = pessoaRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        changePassword(pessoa.getIdPessoa(), dto.currentPassword(), dto.newPassword());
    }

    @Transactional
    public void changePassword(Long idPessoa, String currentPassword, String newPassword) {
        Pessoa pessoa = getPessoaEntityById(idPessoa);

        if (!passwordEncoder.matches(currentPassword, pessoa.getSenha())) {
            throw new RuntimeException("A senha atual está incorreta.");
        }

        pessoa.setSenha(passwordEncoder.encode(newPassword));
        pessoaRepository.save(pessoa);
    }

    private Pessoa getPessoaEntityById(Long idPessoa){
        return pessoaRepository.findById(idPessoa).orElseThrow(() -> new EntityNotFoundException(idPessoa));
    }
}