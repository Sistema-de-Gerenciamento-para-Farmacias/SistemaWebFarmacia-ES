package com.br.farmacia.apiFarmacia.controller;

import com.br.farmacia.apiFarmacia.data.dto.request.PessoaRequestDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.LoginResponseDTO;
import com.br.farmacia.apiFarmacia.data.dto.response.PessoaResponseDTO;
import com.br.farmacia.apiFarmacia.exceptions.RestErrorMessage;
import com.br.farmacia.apiFarmacia.service.AuthenticationService;
import com.br.farmacia.apiFarmacia.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping(value = "/login",
            consumes = "application/json",
            produces = "application/json")
    public ResponseEntity<?> login(@RequestBody PessoaRequestDTO pessoaRequestDTO) {
        try {
            var authToken = new UsernamePasswordAuthenticationToken(pessoaRequestDTO.email(), pessoaRequestDTO.senha());
            Authentication auth = this.authenticationManager.authenticate(authToken);
            var token = jwtService.generateToken(auth);
            return ResponseEntity.ok(new LoginResponseDTO(token));
        } catch (AuthenticationException e) {
            RestErrorMessage error = new RestErrorMessage(HttpStatus.UNAUTHORIZED, "Credenciais de login inválidas.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping(value = "/register",
            consumes = "application/json",
            produces = "application/json")
    public ResponseEntity<PessoaResponseDTO> register(@Valid @RequestBody PessoaRequestDTO pessoaRequestDTO){
        return ResponseEntity.status(HttpStatus.OK).body(authenticationService.register(pessoaRequestDTO));
    }
}


