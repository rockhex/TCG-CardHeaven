package com.tcgtrader.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SetRequest(
        @NotNull UUID gameId,
        @NotBlank String name,
        @NotBlank String code
) {}
