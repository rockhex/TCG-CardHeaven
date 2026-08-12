package com.tcgtrader.service;

import com.tcgtrader.dto.AuthResponse;
import com.tcgtrader.dto.LoginRequest;
import com.tcgtrader.dto.UserRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(UserRequest request);
}
