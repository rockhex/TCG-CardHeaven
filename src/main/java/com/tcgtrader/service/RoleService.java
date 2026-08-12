package com.tcgtrader.service;

import com.tcgtrader.dto.RoleRequest;
import com.tcgtrader.dto.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface RoleService {
    RoleResponse create(RoleRequest request);
    RoleResponse findById(UUID id);
    List<RoleResponse> findAll();
}
