package com.br.farmacia.apiFarmacia.service;

import com.br.farmacia.apiFarmacia.data.entity.UserAuthenticated;
import com.br.farmacia.apiFarmacia.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private PessoaRepository pessoaRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return pessoaRepository.findByEmail(email)
                .map(pessoa -> {
                    // 🔒 VERIFICA SE O USUÁRIO ESTÁ ATIVO (não excluído)
                    if (pessoa.getDataExclusao() != null) {
                        throw new UsernameNotFoundException("Usuário está inativo/excluído: " + email);
                    }
                    return new UserAuthenticated(pessoa);
                })
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + email));
    }
}