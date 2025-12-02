package com.br.farmacia.apiFarmacia.exceptions.general;

public class EntityNotFoundException extends RuntimeException{

    public EntityNotFoundException(Long id){
        super("Entity not found with id :" + id);
    }
}
