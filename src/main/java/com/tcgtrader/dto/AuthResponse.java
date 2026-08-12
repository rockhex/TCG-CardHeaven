package com.tcgtrader.dto;

import java.util.UUID;

public record AuthResponse(
        String token,
        UUID userId,
        String role,
        String email
) {}
