package com.tcgtrader.service;

import com.tcgtrader.dto.CardRequest;
import com.tcgtrader.dto.CardResponse;

import java.util.List;
import java.util.UUID;

public interface CardService {
    CardResponse create(CardRequest request);
    CardResponse findById(UUID id);
    List<CardResponse> findAll();
    List<CardResponse> search(String name);
    CardResponse update(UUID id, CardRequest request);
    void delete(UUID id);
}
