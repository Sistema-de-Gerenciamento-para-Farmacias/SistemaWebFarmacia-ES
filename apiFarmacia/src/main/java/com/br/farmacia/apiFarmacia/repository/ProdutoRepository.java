package com.br.farmacia.apiFarmacia.repository;

import com.br.farmacia.apiFarmacia.data.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto,Long> {
}
