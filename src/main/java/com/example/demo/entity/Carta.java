package com.example.demo.entity;

public class Carta {

    private Long id;
    private String nombre;
    private String juego;      // Ej: Yu-Gi-Oh, Pokemon, Magic
    private String rareza;     // Ej: Común, Rara, Ultra Rara
    private Double precio;
    private String estado;     // Ej: Nuevo, Usado

    public Carta() {}

    public Carta(Long id, String nombre, String juego, String rareza, Double precio, String estado) {
        this.id = id;
        this.nombre = nombre;
        this.juego = juego;
        this.rareza = rareza;
        this.precio = precio;
        this.estado = estado;
    }

    // Getters y Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getJuego() {
        return juego;
    }

    public void setJuego(String juego) {
        this.juego = juego;
    }

    public String getRareza() {
        return rareza;
    }

    public void setRareza(String rareza) {
        this.rareza = rareza;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
