package com.tcgtrader.dto;

import jakarta.validation.constraints.NotBlank;

public record AddressRequest(
        @NotBlank String street,
        @NotBlank String city,
        @NotBlank String country,
        String zipCode
) {}
