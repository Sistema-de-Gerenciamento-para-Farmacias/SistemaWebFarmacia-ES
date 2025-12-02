package com.br.farmacia.apiFarmacia.repository;

import com.br.farmacia.apiFarmacia.data.entity.ItensVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItensVendaRepository extends JpaRepository<ItensVenda, Long> {
}