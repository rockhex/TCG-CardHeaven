#!/bin/bash
# End-to-end endpoint test harness for TCG CardHeaven
# Runs against http://localhost:8080 — requires app + MySQL up

BASE="http://localhost:8080"
PASS=0
FAIL=0
declare -a FAILURES

# Unique suffix so test runs don't collide on unique constraints
TS=$(date +%s)
# Seeded default admin (from DataInitializer)
ADMIN_EMAIL="admin@tcgtrader.com"
ADMIN_PASSWORD="admin123"
CUST_EMAIL="cust_${TS}@test.com"
ADMIN_ROLE_ID="00000000-0000-0000-0000-000000000001"
CUSTOMER_ROLE_ID="00000000-0000-0000-0000-000000000002"

check() {
    local name="$1"; local expected="$2"; local actual="$3"; local body="$4"
    if [[ "$expected" == *"$actual"* ]]; then
        echo "  PASS [$actual] $name"
        PASS=$((PASS+1))
    else
        echo "  FAIL [expected $expected got $actual] $name"
        echo "    body: ${body:0:400}"
        FAIL=$((FAIL+1))
        FAILURES+=("$name (expected $expected got $actual)")
    fi
}

# req METHOD PATH TOKEN JSON -> captures status into $HTTP and body into $BODY
req() {
    local method="$1"; local path="$2"; local token="$3"; local data="$4"
    local tmp; tmp=$(mktemp)
    local auth=()
    [[ -n "$token" ]] && auth=(-H "Authorization: Bearer $token")
    if [[ -n "$data" ]]; then
        HTTP=$(curl -s -o "$tmp" -w "%{http_code}" -X "$method" "${BASE}${path}" \
            -H "Content-Type: application/json" "${auth[@]}" -d "$data")
    else
        HTTP=$(curl -s -o "$tmp" -w "%{http_code}" -X "$method" "${BASE}${path}" "${auth[@]}")
    fi
    BODY=$(cat "$tmp"); rm -f "$tmp"
}

# crude JSON field extractor (string or UUID values)
jget() {
    local key="$1"; local json="$2"
    echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 | sed -E 's/.*"[^"]*"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/'
}

echo "======================================"
echo " AUTH"
echo "======================================"

# 1. Login as seeded default admin
req POST /api/auth/login "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}"
check "POST /api/auth/login (seeded admin)" 200 "$HTTP" "$BODY"
ADMIN_TOKEN=$(jget token "$BODY"); ADMIN_ID=$(jget userId "$BODY")
ADMIN_ROLE_CHECK=$(jget role "$BODY")
[[ "$ADMIN_ROLE_CHECK" == "ADMIN" ]] && echo "  (admin role confirmed in token)" || echo "  WARN admin role = $ADMIN_ROLE_CHECK"

# 2. Register CUSTOMER (default role) — initial address required
ADDR_JSON='{"street":"Calle Falsa 123","city":"Buenos Aires","country":"AR","zipCode":"1000"}'
req POST /api/auth/register "" "{\"name\":\"Customer Test\",\"email\":\"$CUST_EMAIL\",\"password\":\"cust123\",\"initialAddress\":$ADDR_JSON}"
check "POST /api/auth/register (default customer)" 201 "$HTTP" "$BODY"
CUST_TOKEN=$(jget token "$BODY"); CUST_ID=$(jget userId "$BODY")
CUST_ROLE_CHECK=$(jget role "$BODY")
[[ "$CUST_ROLE_CHECK" == "CUSTOMER" ]] && echo "  (customer role confirmed in token)" || echo "  WARN role = $CUST_ROLE_CHECK"

# 2b. Register without initial address — allowed (address added later via /addresses)
req POST /api/auth/register "" "{\"name\":\"No Addr\",\"email\":\"noaddr_${TS}@t.com\",\"password\":\"pw123\"}"
check "POST /api/auth/register (no initialAddress allowed)" 201 "$HTTP" "$BODY"

# 3. Register trying to self-assign admin — MUST now be forced to CUSTOMER
req POST /api/auth/register "" "{\"roleId\":\"$ADMIN_ROLE_ID\",\"name\":\"Hacker\",\"email\":\"hack_${TS}@t.com\",\"password\":\"p\",\"initialAddress\":$ADDR_JSON}"
check "POST /api/auth/register (admin-role escalation attempt)" 201 "$HTTP" "$BODY"
HACK_ROLE=$(jget role "$BODY")
if [[ "$HACK_ROLE" == "CUSTOMER" ]]; then
    echo "  PASS security: register ignored admin roleId (got CUSTOMER)"
    PASS=$((PASS+1))
else
    echo "  FAIL security: register honored admin roleId (got $HACK_ROLE)"
    FAIL=$((FAIL+1))
    FAILURES+=("register allowed role escalation")
fi

# 4. Login customer
req POST /api/auth/login "" "{\"email\":\"$CUST_EMAIL\",\"password\":\"cust123\"}"
check "POST /api/auth/login (customer)" 200 "$HTTP" "$BODY"

# 5. Login wrong password
req POST /api/auth/login "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"wrong\"}"
check "POST /api/auth/login (bad password rejected)" "401 403" "$HTTP" "$BODY"

echo "admin_id=$ADMIN_ID  cust_id=$CUST_ID"

echo "======================================"
echo " ROLES (admin only)"
echo "======================================"

req GET /api/roles "$ADMIN_TOKEN"
check "GET /api/roles (admin)" 200 "$HTTP" "$BODY"

req GET /api/roles "$CUST_TOKEN"
check "GET /api/roles (customer denied)" 403 "$HTTP" "$BODY"

req GET /api/roles "" ""
check "GET /api/roles (anon denied)" 401 "$HTTP" "$BODY"

req GET "/api/roles/$ADMIN_ROLE_ID" "$ADMIN_TOKEN"
check "GET /api/roles/{id} (admin)" 200 "$HTTP" "$BODY"

req POST /api/roles "$ADMIN_TOKEN" '{"name":"ROLE_TEST_'$TS'","description":"temp"}'
check "POST /api/roles (admin)" 201 "$HTTP" "$BODY"

echo "======================================"
echo " GAMES"
echo "======================================"

req GET /api/games "" ""
check "GET /api/games (public)" 200 "$HTTP" "$BODY"

req POST /api/games "$CUST_TOKEN" '{"name":"ShouldNotCreate"}'
check "POST /api/games (customer denied)" 403 "$HTTP" "$BODY"

req POST /api/games "$ADMIN_TOKEN" "{\"name\":\"Pokemon_$TS\"}"
check "POST /api/games (admin)" 201 "$HTTP" "$BODY"
GAME_ID=$(jget id "$BODY")

req GET "/api/games/$GAME_ID" "" ""
check "GET /api/games/{id} (public)" 200 "$HTTP" "$BODY"

echo "======================================"
echo " SETS"
echo "======================================"

req GET /api/sets "" ""
check "GET /api/sets (public)" 200 "$HTTP" "$BODY"

req POST /api/sets "$ADMIN_TOKEN" "{\"gameId\":\"$GAME_ID\",\"name\":\"Base Set\",\"code\":\"BS_$TS\"}"
check "POST /api/sets (admin)" 201 "$HTTP" "$BODY"
SET_ID=$(jget id "$BODY")

req GET "/api/sets/$SET_ID" "" ""
check "GET /api/sets/{id} (public)" 200 "$HTTP" "$BODY"

req GET "/api/games/$GAME_ID/sets" "" ""
check "GET /api/games/{gameId}/sets (public)" 200 "$HTTP" "$BODY"

req POST /api/sets "$CUST_TOKEN" "{\"gameId\":\"$GAME_ID\",\"name\":\"X\",\"code\":\"Y\"}"
check "POST /api/sets (customer denied)" 403 "$HTTP" "$BODY"

echo "======================================"
echo " CARDS"
echo "======================================"

req GET /api/cards "" ""
check "GET /api/cards (public)" 200 "$HTTP" "$BODY"

req GET "/api/cards?search=char" "" ""
check "GET /api/cards?search= (public)" 200 "$HTTP" "$BODY"

req POST /api/cards "$ADMIN_TOKEN" "{\"setId\":\"$SET_ID\",\"name\":\"Charizard\",\"rarity\":\"RARE\",\"condition\":\"MINT\",\"price\":99.99,\"stock\":10,\"imageUrl\":\"http://img/char.png\"}"
check "POST /api/cards (admin)" 201 "$HTTP" "$BODY"
CARD_ID=$(jget id "$BODY")
CARD_ITEM_ID=$(jget itemId "$BODY")

req GET "/api/cards/$CARD_ID" "" ""
check "GET /api/cards/{id} (public)" 200 "$HTTP" "$BODY"

req PUT "/api/cards/$CARD_ID" "$ADMIN_TOKEN" "{\"setId\":\"$SET_ID\",\"name\":\"Charizard V\",\"rarity\":\"RARE\",\"condition\":\"MINT\",\"price\":120.00,\"stock\":15,\"imageUrl\":\"http://img/char.png\"}"
check "PUT /api/cards/{id} (admin)" 200 "$HTTP" "$BODY"

req POST /api/cards "$CUST_TOKEN" "{\"setId\":\"$SET_ID\",\"name\":\"X\",\"price\":1,\"stock\":1}"
check "POST /api/cards (customer denied)" 403 "$HTTP" "$BODY"

echo "======================================"
echo " DECKS"
echo "======================================"

req GET /api/decks "" ""
check "GET /api/decks (public)" 200 "$HTTP" "$BODY"

req POST /api/decks "$ADMIN_TOKEN" "{\"setId\":\"$SET_ID\",\"name\":\"Starter Deck\",\"description\":\"60 card deck\",\"price\":29.99,\"stock\":20}"
check "POST /api/decks (admin)" 201 "$HTTP" "$BODY"
DECK_ID=$(jget id "$BODY")
DECK_ITEM_ID=$(jget itemId "$BODY")

req GET "/api/decks/$DECK_ID" "" ""
check "GET /api/decks/{id} (public)" 200 "$HTTP" "$BODY"

req PUT "/api/decks/$DECK_ID" "$ADMIN_TOKEN" "{\"setId\":\"$SET_ID\",\"name\":\"Starter Deck v2\",\"description\":\"updated\",\"price\":35.00,\"stock\":18}"
check "PUT /api/decks/{id} (admin)" 200 "$HTTP" "$BODY"

echo "======================================"
echo " DISCOUNTS"
echo "======================================"

req GET "/api/items/$CARD_ITEM_ID/discounts" "" ""
check "GET /api/items/{itemId}/discounts (public)" 200 "$HTTP" "$BODY"

req GET "/api/items/$CARD_ITEM_ID/discounts/active" "" ""
check "GET /api/items/{itemId}/discounts/active (public)" 200 "$HTTP" "$BODY"

FROM=$(date -u -d "-1 day" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")
TO=$(date -u -d "+30 days" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")
req POST /api/discounts "$ADMIN_TOKEN" "{\"itemId\":\"$CARD_ITEM_ID\",\"percentage\":10.0,\"validFrom\":\"$FROM\",\"validTo\":\"$TO\",\"active\":true}"
check "POST /api/discounts (admin)" 201 "$HTTP" "$BODY"

echo "======================================"
echo " USERS"
echo "======================================"

req GET "/api/users/$ADMIN_ID" "$ADMIN_TOKEN"
check "GET /api/users/{id} (admin self)" 200 "$HTTP" "$BODY"

req GET "/api/users/$CUST_ID" "$CUST_TOKEN"
check "GET /api/users/{id} (customer self)" 200 "$HTTP" "$BODY"

req GET "/api/users/$ADMIN_ID" "$CUST_TOKEN"
check "GET /api/users/{id} (other user denied)" 403 "$HTTP" "$BODY"

req POST /api/users "$ADMIN_TOKEN" "{\"name\":\"Sub User\",\"email\":\"sub_${TS}@t.com\",\"password\":\"pw123\"}"
check "POST /api/users (admin creates, role defaults to CUSTOMER)" 201 "$HTTP" "$BODY"
SUB_ID=$(jget id "$BODY")
SUB_ROLE=$(jget roleName "$BODY")
[[ "$SUB_ROLE" == "CUSTOMER" ]] && echo "  (default role = CUSTOMER)" || echo "  WARN role=$SUB_ROLE"

# PATCH role: customer cannot change roles
req PATCH "/api/users/$SUB_ID/role" "$CUST_TOKEN" "{\"roleId\":\"$ADMIN_ROLE_ID\"}"
check "PATCH /api/users/{id}/role (customer denied)" "401 403" "$HTTP" "$BODY"

# PATCH role: admin promotes to ADMIN
req PATCH "/api/users/$SUB_ID/role" "$ADMIN_TOKEN" "{\"roleId\":\"$ADMIN_ROLE_ID\"}"
check "PATCH /api/users/{id}/role (admin promotes)" 200 "$HTTP" "$BODY"
NEW_ROLE=$(jget roleName "$BODY")
[[ "$NEW_ROLE" == "ADMIN" ]] && echo "  (role updated to ADMIN)" || echo "  WARN role=$NEW_ROLE"

req DELETE "/api/users/$SUB_ID" "$ADMIN_TOKEN"
check "DELETE /api/users/{id} (admin)" 204 "$HTTP" "$BODY"

echo "======================================"
echo " ADDRESSES"
echo "======================================"

req GET "/api/users/$CUST_ID/addresses" "$CUST_TOKEN"
check "GET /api/users/{userId}/addresses (self, initial address present)" 200 "$HTTP" "$BODY"
INITIAL_ADDR_ID=$(jget id "$BODY")

req POST "/api/users/$CUST_ID/addresses" "$CUST_TOKEN" '{"street":"Av Siempre Viva 742","city":"Springfield","country":"US","zipCode":"12345"}'
check "POST /api/users/{userId}/addresses (self)" 201 "$HTTP" "$BODY"
NEW_ADDR_ID=$(jget id "$BODY")

req GET "/api/users/$ADMIN_ID/addresses" "$CUST_TOKEN"
check "GET addresses (other user denied)" 403 "$HTTP" "$BODY"

req POST "/api/users/$CUST_ID/addresses" "$CUST_TOKEN" '{"street":"","city":"","country":"","zipCode":""}'
check "POST addresses (blank fields rejected)" 400 "$HTTP" "$BODY"

req DELETE "/api/users/$CUST_ID/addresses/$NEW_ADDR_ID" "$CUST_TOKEN"
check "DELETE /api/users/{userId}/addresses/{id} (self)" 204 "$HTTP" "$BODY"

req DELETE "/api/users/$CUST_ID/addresses/00000000-0000-0000-0000-000000000099" "$CUST_TOKEN"
check "DELETE addresses/{missing id}" 404 "$HTTP" "$BODY"

echo "======================================"
echo " CART"
echo "======================================"

req GET "/api/users/$CUST_ID/cart" "$CUST_TOKEN"
check "GET /api/users/{userId}/cart (self)" 200 "$HTTP" "$BODY"

req POST "/api/users/$CUST_ID/cart/items" "$CUST_TOKEN" "{\"itemId\":\"$CARD_ITEM_ID\",\"quantity\":2}"
check "POST cart/items (add card)" 201 "$HTTP" "$BODY"
CART_ITEM_ID=$(jget id "$BODY")

req GET "/api/users/$ADMIN_ID/cart" "$CUST_TOKEN"
check "GET cart (other user denied)" 403 "$HTTP" "$BODY"

req DELETE "/api/users/$CUST_ID/cart/items/$CARD_ITEM_ID" "$CUST_TOKEN"
check "DELETE cart/items/{itemId}" 200 "$HTTP" "$BODY"

# Re-add for checkout
req POST "/api/users/$CUST_ID/cart/items" "$CUST_TOKEN" "{\"itemId\":\"$CARD_ITEM_ID\",\"quantity\":1}"
check "POST cart/items (re-add for checkout)" 201 "$HTTP" "$BODY"

echo "======================================"
echo " ORDERS / CHECKOUT"
echo "======================================"

# Checkout with the customer's registered initial address
req POST "/api/users/$CUST_ID/checkout" "$CUST_TOKEN" "{\"addressId\":\"$INITIAL_ADDR_ID\",\"paymentProvider\":\"STRIPE\",\"externalProcessorId\":\"pi_test_123\"}"
check "POST /api/users/{userId}/checkout (real address)" 201 "$HTTP" "$BODY"
ORDER_ID=$(jget id "$BODY")

# Checkout with an unknown address → 404
req POST "/api/users/$CUST_ID/checkout" "$CUST_TOKEN" "{\"addressId\":\"00000000-0000-0000-0000-000000000099\",\"paymentProvider\":\"STRIPE\",\"externalProcessorId\":\"pi_test_123\"}"
check "POST /api/users/{userId}/checkout (unknown address)" "404 422" "$HTTP" "$BODY"

# Checkout with missing addressId → 400 (bean-validation) or 422
req POST "/api/users/$CUST_ID/checkout" "$CUST_TOKEN" '{"paymentProvider":"STRIPE","externalProcessorId":"pi_test_noaddr"}'
check "POST /api/users/{userId}/checkout (missing addressId)" "400 422" "$HTTP" "$BODY"

req GET "/api/users/$CUST_ID/orders" "$CUST_TOKEN"
check "GET /api/users/{userId}/orders (self)" 200 "$HTTP" "$BODY"

if [[ -n "$ORDER_ID" && "$ORDER_ID" != "00000000-0000-0000-0000-000000000099" ]]; then
  req GET "/api/orders/$ORDER_ID" "$CUST_TOKEN"
  check "GET /api/orders/{id}" 200 "$HTTP" "$BODY"
fi

echo "======================================"
echo " ADMIN"
echo "======================================"

req GET /api/admin/stock-movements "$ADMIN_TOKEN"
check "GET /api/admin/stock-movements (admin)" 200 "$HTTP" "$BODY"

req GET /api/admin/stock-movements "$CUST_TOKEN"
check "GET /api/admin/stock-movements (customer denied)" 403 "$HTTP" "$BODY"

req GET /api/admin/orders "$ADMIN_TOKEN"
check "GET /api/admin/orders (admin)" 200 "$HTTP" "$BODY"

echo "======================================"
echo " E2E: register-no-addr -> add addr -> cart -> checkout"
echo "======================================"

E2E_EMAIL="e2e_${TS}@test.com"

# 1. Register new customer WITHOUT initial address
req POST /api/auth/register "" "{\"name\":\"E2E User\",\"email\":\"$E2E_EMAIL\",\"password\":\"e2e123\"}"
check "E2E: register (no initialAddress)" 201 "$HTTP" "$BODY"
E2E_TOKEN=$(jget token "$BODY"); E2E_ID=$(jget userId "$BODY")

# 2. Confirm the new user has zero addresses
req GET "/api/users/$E2E_ID/addresses" "$E2E_TOKEN"
check "E2E: GET addresses (empty after register)" 200 "$HTTP" "$BODY"
if echo "$BODY" | grep -q '"id"'; then
    echo "  FAIL address list should be empty"; FAIL=$((FAIL+1))
    FAILURES+=("E2E new user had unexpected addresses")
else
    echo "  PASS address list is empty"; PASS=$((PASS+1))
fi

# 3. Attempting checkout before adding an address must fail (no addressId to reference)
req POST "/api/users/$E2E_ID/checkout" "$E2E_TOKEN" "{\"addressId\":\"00000000-0000-0000-0000-000000000099\",\"paymentProvider\":\"STRIPE\",\"externalProcessorId\":\"pi_pre_addr\"}"
check "E2E: checkout before address rejected" "404 422 400" "$HTTP" "$BODY"

# 4. Add an address
req POST "/api/users/$E2E_ID/addresses" "$E2E_TOKEN" '{"street":"Av Corrientes 1234","city":"CABA","country":"AR","zipCode":"C1043"}'
check "E2E: POST addresses (add first address)" 201 "$HTTP" "$BODY"
E2E_ADDR_ID=$(jget id "$BODY")

# 5. GET cart (should exist and be empty)
req GET "/api/users/$E2E_ID/cart" "$E2E_TOKEN"
check "E2E: GET cart (empty)" 200 "$HTTP" "$BODY"

# 6. Add card to cart (quantity 3)
req POST "/api/users/$E2E_ID/cart/items" "$E2E_TOKEN" "{\"itemId\":\"$CARD_ITEM_ID\",\"quantity\":3}"
check "E2E: POST cart/items (add card x3)" 201 "$HTTP" "$BODY"

# 7. Add deck to cart (quantity 1)
req POST "/api/users/$E2E_ID/cart/items" "$E2E_TOKEN" "{\"itemId\":\"$DECK_ITEM_ID\",\"quantity\":1}"
check "E2E: POST cart/items (add deck x1)" 201 "$HTTP" "$BODY"

# 8. Remove the deck from cart
req DELETE "/api/users/$E2E_ID/cart/items/$DECK_ITEM_ID" "$E2E_TOKEN"
check "E2E: DELETE cart/items (remove deck)" 200 "$HTTP" "$BODY"

# 9. Verify cart now contains only the card
req GET "/api/users/$E2E_ID/cart" "$E2E_TOKEN"
check "E2E: GET cart (after remove)" 200 "$HTTP" "$BODY"
if echo "$BODY" | grep -q "\"itemId\":\"$DECK_ITEM_ID\""; then
    echo "  FAIL deck still present after delete"; FAIL=$((FAIL+1))
    FAILURES+=("E2E deck not removed from cart")
else
    echo "  PASS deck removed from cart"; PASS=$((PASS+1))
fi

# 10. Checkout with the address and a fake payment processor id
req POST "/api/users/$E2E_ID/checkout" "$E2E_TOKEN" "{\"addressId\":\"$E2E_ADDR_ID\",\"paymentProvider\":\"STRIPE\",\"externalProcessorId\":\"pi_e2e_${TS}\"}"
check "E2E: POST checkout (pay)" 201 "$HTTP" "$BODY"
E2E_ORDER_ID=$(jget id "$BODY")
E2E_ORDER_STATUS=$(jget status "$BODY")
echo "  order_id=$E2E_ORDER_ID status=$E2E_ORDER_STATUS"

# 11. Order must show up in the user's order history
req GET "/api/users/$E2E_ID/orders" "$E2E_TOKEN"
check "E2E: GET user orders" 200 "$HTTP" "$BODY"
if echo "$BODY" | grep -q "\"id\":\"$E2E_ORDER_ID\""; then
    echo "  PASS order appears in history"; PASS=$((PASS+1))
else
    echo "  FAIL order not found in history"; FAIL=$((FAIL+1))
    FAILURES+=("E2E order missing from /orders")
fi

# 12. Fetch the order by id
if [[ -n "$E2E_ORDER_ID" ]]; then
    req GET "/api/orders/$E2E_ORDER_ID" "$E2E_TOKEN"
    check "E2E: GET /api/orders/{id}" 200 "$HTTP" "$BODY"
fi

# 13. Cart must be empty after checkout
req GET "/api/users/$E2E_ID/cart" "$E2E_TOKEN"
check "E2E: GET cart (after checkout)" 200 "$HTTP" "$BODY"
if echo "$BODY" | grep -q "\"itemId\":\"$CARD_ITEM_ID\""; then
    echo "  FAIL cart not cleared after checkout"; FAIL=$((FAIL+1))
    FAILURES+=("E2E cart not cleared after checkout")
else
    echo "  PASS cart cleared after checkout"; PASS=$((PASS+1))
fi

echo "======================================"
echo " DELETE CASCADE (cards/decks/cart)"
echo "======================================"

req DELETE "/api/users/$CUST_ID/cart" "$CUST_TOKEN"
check "DELETE /api/users/{userId}/cart (clear)" 204 "$HTTP" "$BODY"

req DELETE "/api/cards/$CARD_ID" "$ADMIN_TOKEN"
check "DELETE /api/cards/{id} (admin)" "204 409" "$HTTP" "$BODY"

req DELETE "/api/decks/$DECK_ID" "$ADMIN_TOKEN"
check "DELETE /api/decks/{id} (admin)" "204 409" "$HTTP" "$BODY"

echo ""
echo "======================================"
echo " RESULT: $PASS passed, $FAIL failed"
echo "======================================"
if [[ $FAIL -gt 0 ]]; then
  echo "Failures:"
  for f in "${FAILURES[@]}"; do echo "  - $f"; done
fi
