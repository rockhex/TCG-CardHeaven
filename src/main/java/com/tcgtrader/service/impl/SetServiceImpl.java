package com.tcgtrader.service.impl;

import com.tcgtrader.dto.SetRequest;
import com.tcgtrader.dto.SetResponse;
import com.tcgtrader.entity.Game;
import com.tcgtrader.entity.GameSet;
import com.tcgtrader.exception.ResourceNotFoundException;
import com.tcgtrader.repository.GameRepository;
import com.tcgtrader.repository.GameSetRepository;
import com.tcgtrader.service.SetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SetServiceImpl implements SetService {

    private final GameSetRepository gameSetRepository;
    private final GameRepository gameRepository;

    @Override
    @Transactional
    public SetResponse create(SetRequest request) {
        Game game = gameRepository.findById(request.gameId())
                .orElseThrow(() -> new ResourceNotFoundException("Game not found: " + request.gameId()));
        GameSet set = GameSet.builder().game(game).name(request.name()).code(request.code()).build();
        return SetResponse.from(gameSetRepository.save(set));
    }

    @Override
    @Transactional(readOnly = true)
    public SetResponse findById(UUID id) {
        return gameSetRepository.findById(id)
                .map(SetResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Set not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SetResponse> findAll() {
        return gameSetRepository.findAll().stream().map(SetResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SetResponse> findByGame(UUID gameId) {
        return gameSetRepository.findByGameId(gameId).stream().map(SetResponse::from).toList();
    }
}
