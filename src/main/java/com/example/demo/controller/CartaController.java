package com.example.demo.controller;

import com.example.demo.entity.Carta;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/cartas")
public class CartaController {

    private List<Carta> cartas = new ArrayList<>();

    @GetMapping
    public List<Carta> obtenerCartas() {
        return cartas;
    }

    @PostMapping
    public void crearCarta(@RequestBody Carta carta) {
        cartas.add(carta);
    }
}