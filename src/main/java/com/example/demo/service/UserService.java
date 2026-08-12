package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<User> obtenerUsuarios() {
        return repository.findAll();
    }

    public void guardarUsuario(User user) {
        repository.save(user);
    }
}