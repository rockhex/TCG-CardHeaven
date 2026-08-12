package com.tcgtrader.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "stock_movements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovement {

    public enum Reason { SALE, RETURN, RESTOCK, ADJUSTMENT, INITIAL }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "quantity_delta", nullable = false)
    private int quantityDelta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    private Reason reason;

    @Column(name = "reference_id")
    private UUID referenceId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "stock_after", nullable = false)
    private int stockAfter;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    private Instant occurredAt;

    @PrePersist
    void prePersist() {
        this.occurredAt = Instant.now();
    }
}
