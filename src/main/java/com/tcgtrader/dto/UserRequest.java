package com.tcgtrader.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record UserRequest(
        UUID roleId,
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String password,
        @Valid AddressRequest initialAddress
) {}
