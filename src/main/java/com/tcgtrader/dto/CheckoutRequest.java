package com.tcgtrader.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CheckoutRequest(
        @NotNull UUID addressId,
        @NotBlank String paymentProvider,
        @NotBlank String externalProcessorId
) {}
