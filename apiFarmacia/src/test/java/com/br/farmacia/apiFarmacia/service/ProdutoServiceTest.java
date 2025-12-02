package com.br.farmacia.apiFarmacia.service;

import com.br.farmacia.apiFarmacia.data.dto.request.ProdutoRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.ProdutoResponseDTO;
import com.br.farmacia.apiFarmacia.data.entity.Produto;
import com.br.farmacia.apiFarmacia.exceptions.general.EntityNotFoundException;
import com.br.farmacia.apiFarmacia.repository.ProdutoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProdutoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @InjectMocks
    private ProdutoService produtoService;

    private ProdutoRequestDTO requestDTO;
    private Produto produto;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        requestDTO = new ProdutoRequestDTO(
                "Dipirona",
                12.50,
                "Analgésico",
                "imagem.png",
                new Date(),
                "Neo Química"
        );

        produto = new Produto(requestDTO);
        produto.setIdProduto(1L);
    }

    @Test
    void testCreateProduto() {
        when(produtoRepository.save(any(Produto.class))).thenReturn(produto);

        ProdutoResponseDTO response = produtoService.createProduto(requestDTO);

        assertNotNull(response);
        assertEquals("Dipirona", response.nome());
        assertEquals(12.50, response.preco());
        verify(produtoRepository, times(1)).save(any(Produto.class));
    }

    @Test
    void testGetProdutoById() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        ProdutoResponseDTO response = produtoService.getProdutoById(1L);

        assertNotNull(response);
        assertEquals(1L, response.idProduto());
        verify(produtoRepository, times(1)).findById(1L);
    }

    @Test
    void testGetProdutoById_NotFound() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> produtoService.getProdutoById(1L));
    }

    @Test
    void testUpdateProduto() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(produtoRepository.save(any(Produto.class))).thenReturn(produto);

        ProdutoResponseDTO response = produtoService.updateProduto(1L, requestDTO);

        assertNotNull(response);
        assertEquals("Dipirona", response.nome());
        verify(produtoRepository, times(1)).save(produto);
    }

    @Test
    void testDeleteProduto() {
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));
        when(produtoRepository.save(any(Produto.class))).thenReturn(produto);

        String msg = produtoService.deleteProduto(1L);

        assertEquals("Produto Id: 1 deletado com sucesso!", msg);
        verify(produtoRepository, times(1)).save(produto);
    }

    @Test
    void testGetAllProdutos() {
        when(produtoRepository.findAll()).thenReturn(List.of(produto));

        List<ProdutoResponseDTO> lista = produtoService.getAllProdutos();

        assertEquals(1, lista.size());
        assertEquals("Dipirona", lista.get(0).nome());
        verify(produtoRepository, times(1)).findAll();
    }
}
