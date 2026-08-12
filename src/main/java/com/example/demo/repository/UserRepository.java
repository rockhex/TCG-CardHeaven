package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class UserRepository {

    private List<User> usuarios = new ArrayList<>();

    public List<User> findAll() {
        return usuarios;
    }

    public void save(User user) {
        usuarios.add(user);
    }
}