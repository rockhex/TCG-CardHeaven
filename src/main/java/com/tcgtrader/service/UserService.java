package com.tcgtrader.service;

import com.tcgtrader.dto.UserRequest;
import com.tcgtrader.dto.UserResponse;

import java.util.UUID;

public interface UserService {
    UserResponse create(UserRequest request);
    UserResponse findById(UUID id);
    UserResponse changeRole(UUID id, UUID roleId);
    void delete(UUID id);
}
