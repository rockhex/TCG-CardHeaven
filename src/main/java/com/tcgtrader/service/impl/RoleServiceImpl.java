package com.tcgtrader.service.impl;

import com.tcgtrader.dto.RoleRequest;
import com.tcgtrader.dto.RoleResponse;
import com.tcgtrader.entity.Role;
import com.tcgtrader.exception.ResourceNotFoundException;
import com.tcgtrader.repository.RoleRepository;
import com.tcgtrader.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public RoleResponse create(RoleRequest request) {
        Role role = Role.builder().name(request.name()).description(request.description()).build();
        return RoleResponse.from(roleRepository.save(role));
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse findById(UUID id) {
        return roleRepository.findById(id)
                .map(RoleResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> findAll() {
        return roleRepository.findAll().stream().map(RoleResponse::from).toList();
    }
}
