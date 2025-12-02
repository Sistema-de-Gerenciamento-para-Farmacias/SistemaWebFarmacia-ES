package com.br.farmacia.apiFarmacia.data.entity;

import lombok.Getter;

@Getter
public enum UserRole {
    ADMIN("admin"),
    EMPLOY("employee"),
    USER("user");

    private final String role;

    UserRole(String role) {
        this.role = role;
    }

}