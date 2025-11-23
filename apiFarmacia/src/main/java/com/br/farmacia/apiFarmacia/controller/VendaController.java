package com.br.farmacia.apiFarmacia.controller;

import com.br.farmacia.apiFarmacia.data.dto.request.VendaRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.VendaResponseDTO;
import com.br.farmacia.apiFarmacia.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/venda")
public class VendaController {

    @Autowired
    private VendaService vendaService;

    @GetMapping("/all")
    public ResponseEntity<List<VendaResponseDTO>> getAllVendas() {
        return ResponseEntity.status(HttpStatus.OK).body(vendaService.getAllVendas());
    }


    @GetMapping("/{idVenda}")
    public ResponseEntity<VendaResponseDTO> getVendaById(@PathVariable Long idVenda) {
        return ResponseEntity.status(HttpStatus.OK).body(vendaService.getVendaById(idVenda));
    }


    @PostMapping("/create")
    public ResponseEntity<VendaResponseDTO> createVenda(@RequestBody @Valid VendaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vendaService.createVenda(dto));
    }

    @PutMapping("/update/{idVenda}")
    public ResponseEntity<VendaResponseDTO> updateVenda(
            @PathVariable Long idVenda,
            @RequestBody @Valid VendaRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.OK).body(vendaService.updateVenda(idVenda, dto));
    }

    @DeleteMapping("/delete/{idVenda}")
    public ResponseEntity<String> deleteVenda(@PathVariable Long idVenda) {
        return ResponseEntity.status(HttpStatus.OK).body(vendaService.deleteVenda(idVenda));
    }
}