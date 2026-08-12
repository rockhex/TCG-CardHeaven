package com.tcgtrader.service.impl;

import com.tcgtrader.dto.AddressRequest;
import com.tcgtrader.dto.AddressResponse;
import com.tcgtrader.entity.Address;
import com.tcgtrader.entity.User;
import com.tcgtrader.exception.ResourceNotFoundException;
import com.tcgtrader.repository.AddressRepository;
import com.tcgtrader.repository.UserRepository;
import com.tcgtrader.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> list(UUID userId) {
        return getUser(userId).getAddresses().stream().map(AddressResponse::from).toList();
    }

    @Override
    @Transactional
    public AddressResponse create(UUID userId, AddressRequest request) {
        User user = getUser(userId);
        Address address = Address.builder()
                .user(user)
                .street(request.street())
                .city(request.city())
                .country(request.country())
                .zipCode(request.zipCode())
                .build();
        Address saved = addressRepository.save(address);
        return AddressResponse.from(saved);
    }

    @Override
    @Transactional
    public void delete(UUID userId, UUID addressId) {
        User user = getUser(userId);
        boolean removed = user.getAddresses().removeIf(a -> a.getId().equals(addressId));
        if (!removed) {
            throw new ResourceNotFoundException("Address not found: " + addressId);
        }
        userRepository.save(user);
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }
}
