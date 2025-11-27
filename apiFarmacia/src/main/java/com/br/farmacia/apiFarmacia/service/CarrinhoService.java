package com.br.farmacia.apiFarmacia.service;

import com.br.farmacia.apiFarmacia.data.dto.request.ItemCarrinhoRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.CarrinhoResponseDTO;
import com.br.farmacia.apiFarmacia.data.entity.Carrinho;
import com.br.farmacia.apiFarmacia.data.entity.ItensCarrinho;
import com.br.farmacia.apiFarmacia.data.entity.Pessoa;
import com.br.farmacia.apiFarmacia.data.entity.Produto;
import com.br.farmacia.apiFarmacia.exceptions.general.EntityNotFoundException;
import com.br.farmacia.apiFarmacia.repository.CarrinhoRepository;
import com.br.farmacia.apiFarmacia.repository.PessoaRepository;
import com.br.farmacia.apiFarmacia.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class CarrinhoService {

    @Autowired
    private CarrinhoRepository carrinhoRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Transactional
    public CarrinhoResponseDTO getCarrinhoByUsuario(Long idUsuario) {
        Pessoa pessoa = getPessoaById(idUsuario);
        Carrinho carrinho = carrinhoRepository.findByUsuario(pessoa)
                .orElseGet(() -> criarNovoCarrinho(pessoa));

        return new CarrinhoResponseDTO(carrinho);
    }

    @Transactional
    public CarrinhoResponseDTO adicionarItem(Long idUsuario, ItemCarrinhoRequestDTO dto) {
        Pessoa pessoa = getPessoaById(idUsuario);

        Carrinho carrinho = carrinhoRepository.findByUsuario(pessoa)
                .orElseGet(() -> criarNovoCarrinho(pessoa));

        Produto produto = produtoRepository.findById(dto.idProduto())
                .orElseThrow(() -> new EntityNotFoundException(dto.idProduto()));

        Optional<ItensCarrinho> itemExistente = carrinho.getItens().stream()
                .filter(item -> item.getProduto().getIdProduto().equals(dto.idProduto()))
                .findFirst();

        if (itemExistente.isPresent()) {
            ItensCarrinho item = itemExistente.get();
            item.setQuantidade(item.getQuantidade() + dto.quantidade());
        } else {
            ItensCarrinho novoItem = new ItensCarrinho();
            novoItem.setCarrinho(carrinho);
            novoItem.setProduto(produto);
            novoItem.setQuantidade(dto.quantidade());
            carrinho.getItens().add(novoItem);
        }

        Carrinho carrinhoSalvo = carrinhoRepository.save(carrinho);
        return new CarrinhoResponseDTO(carrinhoSalvo);
    }

    @Transactional
    public String removerItem(Long idUsuario, Long idItemCarrinho) {
        Pessoa pessoa = getPessoaById(idUsuario);

        Carrinho carrinho = carrinhoRepository.findByUsuario(pessoa)
                .orElseThrow(() -> new EntityNotFoundException(idUsuario));

        boolean removed = carrinho.getItens().removeIf(item -> item.getIdItemCarrinho().equals(idItemCarrinho));

        if (!removed) {
            throw new EntityNotFoundException(idItemCarrinho);
        }

        carrinhoRepository.save(carrinho);
        return "Item removido com sucesso!";
    }

    @Transactional
    public String limparCarrinho(Long idUsuario) {
        Pessoa pessoa = getPessoaById(idUsuario);

        Carrinho carrinho = carrinhoRepository.findByUsuario(pessoa)
                .orElseThrow(() -> new EntityNotFoundException(idUsuario));

        carrinho.getItens().clear();
        carrinhoRepository.save(carrinho);

        return "Carrinho limpo com sucesso!";
    }

    private Pessoa getPessoaById(Long id) {
        return pessoaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(id));
    }

    private Carrinho criarNovoCarrinho(Pessoa pessoa) {
        Carrinho novo = new Carrinho();
        novo.setUsuario(pessoa);
        novo.setDataCriacao(LocalDate.now());
        return carrinhoRepository.save(novo);
    }
}