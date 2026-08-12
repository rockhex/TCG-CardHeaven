package com.tcgtrader.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(nullable = false)
    private String type;

    @OneToOne(mappedBy = "item", fetch = FetchType.LAZY)
    private Card card;

    @OneToOne(mappedBy = "item", fetch = FetchType.LAZY)
    private Deck deck;
}
