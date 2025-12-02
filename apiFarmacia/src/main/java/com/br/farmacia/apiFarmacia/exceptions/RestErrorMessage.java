package com.br.farmacia.apiFarmacia.exceptions;

import org.springframework.http.HttpStatus;

import javax.xml.crypto.Data;
import java.util.Date;

public record RestErrorMessage(
        HttpStatus status,
        String message,
        Date timestamp
) {
    public RestErrorMessage(HttpStatus status, String message){
        this(status,message,new Date());
    }
}

