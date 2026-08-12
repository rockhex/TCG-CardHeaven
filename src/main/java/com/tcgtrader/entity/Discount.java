package com.tcgtrader.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "discounts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @NotNull
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    @NotNull
    @Column(name = "valid_from", nullable = false)
    private Instant validFrom;

    @NotNull
    @Column(name = "valid_to", nullable = false)
    private Instant validTo;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
