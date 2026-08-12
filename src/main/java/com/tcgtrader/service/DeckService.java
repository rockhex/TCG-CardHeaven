package com.tcgtrader.service;

import com.tcgtrader.dto.DeckRequest;
import com.tcgtrader.dto.DeckResponse;

import java.util.List;
import java.util.UUID;

public interface DeckService {
    DeckResponse create(DeckRequest request);
    DeckResponse findById(UUID id);
    List<DeckResponse> findAll();
    DeckResponse update(UUID id, DeckRequest request);
    void delete(UUID id);
}
