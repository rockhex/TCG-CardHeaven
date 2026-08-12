-- =====================
-- ROLES
-- =====================
CREATE TABLE roles (
    id          CHAR(36) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT
);

-- =====================
-- USERS
-- =====================
CREATE TABLE users (
    id            CHAR(36) PRIMARY KEY,
    role_id       CHAR(36) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    name          VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login    TIMESTAMP NULL,
    deleted       BOOLEAN NOT NULL DEFAULT FALSE,
    email_active  VARCHAR(255) AS (IF(deleted = FALSE, email, NULL)) STORED,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE UNIQUE INDEX users_email_unique_active ON users(email_active);

-- =====================
-- ADDRESSES
-- =====================
CREATE TABLE addresses (
    id       CHAR(36) PRIMARY KEY,
    user_id  CHAR(36) NOT NULL,
    street   VARCHAR(255) NOT NULL,
    city     VARCHAR(255) NOT NULL,
    country  VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================
-- GAMES
-- =====================
CREATE TABLE games (
    id   CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- =====================
-- SETS
-- =====================
CREATE TABLE sets (
    id      CHAR(36) PRIMARY KEY,
    game_id CHAR(36) NOT NULL,
    name    VARCHAR(255) NOT NULL,
    code    VARCHAR(50) NOT NULL,
    CONSTRAINT fk_sets_game FOREIGN KEY (game_id) REFERENCES games(id)
);

-- =====================
-- ITEMS (supertype)
-- =====================
CREATE TABLE items (
    id   CHAR(36) PRIMARY KEY,
    type VARCHAR(50) NOT NULL
);

-- =====================
-- CARDS
-- =====================
CREATE TABLE cards (
    id        CHAR(36) PRIMARY KEY,
    item_id   CHAR(36) NOT NULL UNIQUE,
    set_id    CHAR(36) NOT NULL,
    name      VARCHAR(255) NOT NULL,
    rarity    VARCHAR(50),
    `condition` VARCHAR(50),
    price     DECIMAL(10,2) NOT NULL,
    stock     INT NOT NULL DEFAULT 0,
    image_url TEXT,
    CONSTRAINT fk_cards_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    CONSTRAINT fk_cards_set FOREIGN KEY (set_id) REFERENCES sets(id),
    CONSTRAINT ck_cards_stock CHECK (stock >= 0)
);

-- =====================
-- DECKS
-- =====================
CREATE TABLE decks (
    id          CHAR(36) PRIMARY KEY,
    item_id     CHAR(36) NOT NULL UNIQUE,
    set_id      CHAR(36) NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL,
    stock       INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_decks_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    CONSTRAINT fk_decks_set FOREIGN KEY (set_id) REFERENCES sets(id),
    CONSTRAINT ck_decks_stock CHECK (stock >= 0)
);

-- =====================
-- DECK_CARDS
-- =====================
CREATE TABLE deck_cards (
    deck_id  CHAR(36) NOT NULL,
    card_id  CHAR(36) NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (deck_id, card_id),
    CONSTRAINT fk_deck_cards_deck FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
    CONSTRAINT fk_deck_cards_card FOREIGN KEY (card_id) REFERENCES cards(id),
    CONSTRAINT ck_deck_cards_qty CHECK (quantity > 0)
);

-- =====================
-- DISCOUNTS
-- =====================
CREATE TABLE discounts (
    id         CHAR(36) PRIMARY KEY,
    item_id    CHAR(36) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    valid_from TIMESTAMP NOT NULL,
    valid_to   TIMESTAMP NOT NULL,
    active     BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_discounts_item FOREIGN KEY (item_id) REFERENCES items(id)
);

-- =====================
-- CARTS
-- =====================
CREATE TABLE carts (
    id      CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL UNIQUE,
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================
-- CART_ITEMS
-- =====================
CREATE TABLE cart_items (
    id       CHAR(36) PRIMARY KEY,
    cart_id  CHAR(36) NOT NULL,
    item_id  CHAR(36) NOT NULL,
    quantity INT NOT NULL,
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_item FOREIGN KEY (item_id) REFERENCES items(id),
    CONSTRAINT ck_cart_items_qty CHECK (quantity > 0)
);

-- =====================
-- ORDERS
-- =====================
CREATE TABLE orders (
    id           CHAR(36) PRIMARY KEY,
    user_id      CHAR(36) NOT NULL,
    address_id   CHAR(36) NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL,
    placed_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(id)
);

-- =====================
-- ORDER_ITEMS
-- =====================
CREATE TABLE order_items (
    id         CHAR(36) PRIMARY KEY,
    order_id   CHAR(36) NOT NULL,
    item_id    CHAR(36) NOT NULL,
    quantity   INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_item FOREIGN KEY (item_id) REFERENCES items(id),
    CONSTRAINT ck_order_items_qty CHECK (quantity > 0)
);

-- =====================
-- PAYMENTS
-- =====================
CREATE TABLE payments (
    id                    CHAR(36) PRIMARY KEY,
    order_id              CHAR(36) NOT NULL UNIQUE,
    external_processor_id VARCHAR(255),
    provider              VARCHAR(100) NOT NULL,
    status                VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    amount                DECIMAL(10,2) NOT NULL,
    currency              VARCHAR(10) NOT NULL DEFAULT 'USD',
    processed_at          TIMESTAMP NULL,
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- =====================
-- STOCK MOVEMENTS
-- =====================
CREATE TABLE stock_movements (
    id             CHAR(36) PRIMARY KEY,
    item_id        CHAR(36) NOT NULL,
    quantity_delta INT NOT NULL,
    reason         VARCHAR(20) NOT NULL,
    reference_id   CHAR(36) NULL,
    performed_by   CHAR(36) NOT NULL,
    note           TEXT,
    stock_after    INT NOT NULL,
    occurred_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_movements_item FOREIGN KEY (item_id) REFERENCES items(id),
    CONSTRAINT fk_stock_movements_user FOREIGN KEY (performed_by) REFERENCES users(id)
);

CREATE INDEX stock_movements_item_idx ON stock_movements(item_id);
CREATE INDEX stock_movements_reason_idx ON stock_movements(reason);
CREATE INDEX stock_movements_occurred_idx ON stock_movements(occurred_at);

-- =====================
-- ROLE SEED
-- =====================
INSERT IGNORE INTO roles (id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'ADMIN',    'Administrator'),
    ('00000000-0000-0000-0000-000000000002', 'CUSTOMER', 'Standard user');
