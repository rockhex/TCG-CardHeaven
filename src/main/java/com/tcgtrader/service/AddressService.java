package com.tcgtrader.service;

import com.tcgtrader.dto.AddressRequest;
import com.tcgtrader.dto.AddressResponse;

import java.util.List;
import java.util.UUID;

public interface AddressService {
    List<AddressResponse> list(UUID userId);
    AddressResponse create(UUID userId, AddressRequest request);
    void delete(UUID userId, UUID addressId);
}
