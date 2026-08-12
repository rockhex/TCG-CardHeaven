package com.tcgtrader.controller;

import com.tcgtrader.dto.AuthResponse;
import com.tcgtrader.dto.LoginRequest;
import com.tcgtrader.dto.UserRequest;
import com.tcgtrader.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody UserRequest request) {
        return authService.register(request);
    }
}
