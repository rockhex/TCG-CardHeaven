package com.tcgtrader.service.impl;

import com.tcgtrader.dto.GameRequest;
import com.tcgtrader.dto.GameResponse;
import com.tcgtrader.entity.Game;
import com.tcgtrader.exception.ResourceNotFoundException;
import com.tcgtrader.repository.GameRepository;
import com.tcgtrader.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final GameRepository gameRepository;

    @Override
    @Transactional
    public GameResponse create(GameRequest request) {
        Game game = Game.builder().name(request.name()).build();
        return GameResponse.from(gameRepository.save(game));
    }

    @Override
    @Transactional(readOnly = true)
    public GameResponse findById(UUID id) {
        return gameRepository.findById(id)
                .map(GameResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameResponse> findAll() {
        return gameRepository.findAll().stream().map(GameResponse::from).toList();
    }
}
