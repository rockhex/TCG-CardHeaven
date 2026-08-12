package com.tcgtrader.dto;

import jakarta.validation.constraints.NotBlank;

public record GameRequest(@NotBlank String name) {}
