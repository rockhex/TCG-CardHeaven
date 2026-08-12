package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // GET /usuarios
    @GetMapping
    public List<User> obtenerUsuarios() {
        return service.obtenerUsuarios();
    }

    // POST /usuarios
    @PostMapping
    public void crearUsuario(@RequestBody User user) {
        service.guardarUsuario(user);
    }
}