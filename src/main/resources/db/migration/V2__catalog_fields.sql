-- =====================
-- V2: catalog field changes to align backend responses with the storefront
-- =====================

-- Rarity is modeled as an integer tier 1..5 (1=Common .. 5=Secret Rare), nullable.
-- Clear any legacy non-numeric rarity values so the column type change is safe
-- even when the catalog already holds rows.
UPDATE cards SET rarity = NULL WHERE rarity IS NOT NULL AND rarity NOT REGEXP '^[0-9]+$';
ALTER TABLE cards MODIFY COLUMN rarity INT NULL;

-- Decks now carry their own cover image, like cards.
ALTER TABLE decks ADD COLUMN image_url TEXT NULL;
