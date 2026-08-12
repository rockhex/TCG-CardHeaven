package com.tcgtrader.controller;

import com.tcgtrader.dto.RoleRequest;
import com.tcgtrader.dto.RoleResponse;
import com.tcgtrader.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoleResponse create(@Valid @RequestBody RoleRequest request) {
        return roleService.create(request);
    }

    @GetMapping
    public List<RoleResponse> findAll() {
        return roleService.findAll();
    }

    @GetMapping("/{id}")
    public RoleResponse findById(@PathVariable UUID id) {
        return roleService.findById(id);
    }
}
