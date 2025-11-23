package com.br.farmacia.apiFarmacia.data.entity;
import com.br.farmacia.apiFarmacia.data.dto.request.ProdutoRequestDTO;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "Produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProduto;

    @Column (name = "nome", nullable = false)
    private String nome;

    @Column (name = "preco", nullable = false)
    private Double preco;

    @Column (name = "descricao")
    private String descricao;

    @Column(name = "data_exclusao")
    private LocalDate dataExclusao;

    @Column(name = "linkImagem")
    private String linkImagem;

    @Column(name = "dataValidade")
    private Date dataValidade;

    @Column(name = "fabricante")
    private String fabricante;

    @Builder
    public Produto(ProdutoRequestDTO produtoRequestDTO){
        this.nome = produtoRequestDTO.nome();
        this.preco = produtoRequestDTO.preco();
        this.descricao = produtoRequestDTO.descricao();
        this.linkImagem = produtoRequestDTO.linkImagem();
        this.dataValidade = produtoRequestDTO.dataValidade();
        this.fabricante = produtoRequestDTO.fabricante();
    }
}
