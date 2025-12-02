package com.br.farmacia.apiFarmacia.data.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "carrinho")
public class Carrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCarrinho;

    @OneToOne // Geralmente um usuário tem um carrinho ativo, mas pode ser ManyToOne se preferir histórico
    @JoinColumn(name = "id_usuario", nullable = false)
    private Pessoa usuario;

    @Column(name = "data_criacao", nullable = false)
    private LocalDate dataCriacao;

    // orphanRemoval = true: se remover da lista, apaga do banco
    @OneToMany(mappedBy = "carrinho", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItensCarrinho> itens = new ArrayList<>();
}