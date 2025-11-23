package com.br.farmacia.apiFarmacia.repository;

import com.br.farmacia.apiFarmacia.data.entity.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendaRepository extends JpaRepository<Venda,Long> {
}
