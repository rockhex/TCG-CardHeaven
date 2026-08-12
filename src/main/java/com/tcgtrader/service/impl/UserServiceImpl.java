package com.tcgtrader.service.impl;

import com.tcgtrader.dto.UserRequest;
import com.tcgtrader.dto.UserResponse;
import com.tcgtrader.entity.Cart;
import com.tcgtrader.entity.Role;
import com.tcgtrader.entity.User;
import com.tcgtrader.exception.BusinessException;
import com.tcgtrader.exception.ResourceNotFoundException;
import com.tcgtrader.repository.RoleRepository;
import com.tcgtrader.repository.UserRepository;
import com.tcgtrader.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final UUID DEFAULT_CUSTOMER_ROLE_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email already registered: " + request.email());
        }
        UUID roleId = request.roleId() != null ? request.roleId() : DEFAULT_CUSTOMER_ROLE_ID;
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleId));

        User user = User.builder()
                .role(role)
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        Cart cart = Cart.builder().user(user).build();
        user.setCart(cart);

        return UserResponse.from(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return userRepository.findById(id)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Override
    @Transactional
    public UserResponse changeRole(UUID id, UUID roleId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleId));
        user.setRole(role);
        return UserResponse.from(userRepository.save(user));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setDeleted(true);
            userRepository.save(user);
        });
    }

}
