package com.br.farmacia.apiFarmacia.data.entity;

import com.br.farmacia.apiFarmacia.data.dto.request.VendaRequestDTO;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "venda")
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idVenda;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Pessoa idUsuario;

    @Column(name = "data_compra", nullable = false)
    private LocalDate dataCompra;

    @Column(name = "data_exclusao")
    private LocalDate dataExclusao;

    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL)
    private List<ItensVenda> itens;

}
