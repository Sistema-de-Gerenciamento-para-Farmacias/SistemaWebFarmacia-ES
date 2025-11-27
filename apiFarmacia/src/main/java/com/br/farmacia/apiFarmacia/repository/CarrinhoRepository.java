package com.br.farmacia.apiFarmacia.repository;

import com.br.farmacia.apiFarmacia.data.entity.Carrinho;
import com.br.farmacia.apiFarmacia.data.entity.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {
    Optional<Carrinho> findByUsuario(Pessoa usuario);
}