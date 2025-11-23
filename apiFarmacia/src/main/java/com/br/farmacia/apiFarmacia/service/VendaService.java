package com.br.farmacia.apiFarmacia.service;

import com.br.farmacia.apiFarmacia.data.dto.request.ItensVendaRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.request.VendaRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.VendaResponseDTO;
import com.br.farmacia.apiFarmacia.data.entity.ItensVenda;
import com.br.farmacia.apiFarmacia.data.entity.Pessoa;
import com.br.farmacia.apiFarmacia.data.entity.Produto;
import com.br.farmacia.apiFarmacia.data.entity.Venda;
import com.br.farmacia.apiFarmacia.repository.ItensVendaRepository;
import com.br.farmacia.apiFarmacia.repository.PessoaRepository;
import com.br.farmacia.apiFarmacia.repository.ProdutoRepository;
import com.br.farmacia.apiFarmacia.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendaService {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ItensVendaRepository itensVendaRepository;

    @Transactional(readOnly = true)
    public List<VendaResponseDTO> getAllVendas() {
        List<Venda> vendas = vendaRepository.findAll();
        return vendas.stream().map(VendaResponseDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VendaResponseDTO getVendaById(Long idVenda) {
        Venda venda = getVendaEntityById(idVenda);
        return new VendaResponseDTO(venda);
    }

    @Transactional
    public VendaResponseDTO createVenda(VendaRequestDTO dto) {
        Pessoa pessoa = pessoaRepository.findById(dto.idUsuario())
                .orElseThrow(() -> new RuntimeException("Usuário ID " + dto.idUsuario() + " não encontrado."));

        Venda venda = new Venda();
        venda.setIdUsuario(pessoa);
        venda.setDataCompra(LocalDate.now());

        Venda vendaSalva = vendaRepository.save(venda);

        for (ItensVendaRequestDTO itemDto : dto.itens()) {
            Produto produto = produtoRepository.findById(itemDto.idProduto())
                    .orElseThrow(() -> new RuntimeException("Produto ID " + itemDto.idProduto() + " não encontrado."));

            ItensVenda itemVenda = new ItensVenda();
            itemVenda.setVenda(vendaSalva);
            itemVenda.setProduto(produto);
            itemVenda.setQuantidade(itemDto.quantidade());

            itensVendaRepository.save(itemVenda);
        }

        return new VendaResponseDTO(getVendaEntityById(vendaSalva.getIdVenda()));
    }

    public VendaResponseDTO updateVenda(Long idVenda, VendaRequestDTO dto) {
        Venda venda = getVendaEntityById(idVenda);

        if (!venda.getIdUsuario().getIdPessoa().equals(dto.idUsuario())) {
            Pessoa novaPessoa = pessoaRepository.findById(dto.idUsuario())
                    .orElseThrow(() -> new RuntimeException("Novo Usuário não encontrado."));
            venda.setIdUsuario(novaPessoa);
        }

        Venda vendaAtualizada = vendaRepository.save(venda);
        return new VendaResponseDTO(vendaAtualizada);
    }

    @Transactional
    public String deleteVenda(Long idVenda) {
        Venda venda = getVendaEntityById(idVenda);

        venda.setDataExclusao(LocalDate.now());
        vendaRepository.save(venda);

        return "Venda Id: " + idVenda + " deletada com sucesso!";
    }

    private Venda getVendaEntityById(Long idVenda){
        return vendaRepository.findById(idVenda).orElseThrow(() -> new RuntimeException("Venda não encontrada"));
    }
}