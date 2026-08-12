# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Card Heaven" — a Spanish-language e-commerce frontend for trading cards (TCG, e.g. Pokémon). React 19 SPA bootstrapped from the Vite React template. UI copy and route paths are in Spanish (`/catalogo`, `/ingresar`, `/finalizar-compra`, `/usuario/pedidos`).

The SPA consumes a real **Spring Boot + MySQL backend** (`com.tcgtrader`, at `http://localhost:8080`) that is the source of truth for all data. The backend repo lives at `C:\Users\manu\Desktop\Entrega\TPO--TCG-CardHeaven-Grupo3`. There is no longer any hardcoded product data: the catalog, cart, orders and auth all come from HTTP calls. The backend was extended so its DTOs return exactly what the UI shows (`gameName`, `discountedPrice`, deck contents, order shipping address) and `rarity` is an integer 1–5.

## Commands

```bash
npm run dev      # start Vite dev server with HMR (reads VITE_API_URL from .env)
npm run build    # production build to dist/
npm run preview  # serve the production build locally
npm run lint     # run ESLint across the repo
npm run seed     # node scripts/seed.js — populate the backend catalog via its admin API
```

There is no JS test runner configured. `npm run lint` is expected to pass with a few intentional
`react-hooks/set-state-in-effect` warnings (fetch-in-effect pattern; this app has no data layer).

### Running the full stack (backend must be up first)

```bash
# In the backend repo (C:\Users\manu\Desktop\Entrega\TPO--TCG-CardHeaven-Grupo3):
docker compose up -d        # starts MySQL (container tcgtrader-db, db tcgtrader, root/root, :3306)
mvnw.cmd spring-boot:run    # starts the API on :8080 (Flyway migrates, seeds admin user)

# In this repo:
npm run seed                # one-time: load games/sets/cards/deck into the backend
npm run dev                 # start the frontend
```

Seeded admin: `admin@tcgtrader.com` / `admin123`. New registrations get the `CUSTOMER` role.
The backend has Swagger UI at `http://localhost:8080/swagger-ui.html`.

## Architecture

- **Entry**: `src/main.jsx` mounts `<App />` inside `<BrowserRouter>`, then `<AuthProvider>` and `<CartProvider>`, inside `<StrictMode>`.
- **Routing**: `src/App.jsx` is the single source of routing (`react-router-dom` v7). It no longer holds data or auth state — views fetch their own data and read global state from context.
- **API layer** (`src/api/`): `client.js` is a `fetch` wrapper that injects the JWT (`Authorization: Bearer`, stored in `localStorage` under `ch_token`) and normalizes backend `ProblemDetail` errors into an `ApiError` (message in `.detail`). Per-domain modules: `auth`, `catalog` (merges `/api/cards` + `/api/decks` into one product list with a `type` discriminator), `cart`, `orders`, `addresses`, `cards`, `sets`, `games`, `admin`. Base URL comes from `VITE_API_URL` (`.env`).
- **Global state** (`src/context/`): `AuthContext` (`login`/`register`/`logout`, exposes `userId`, `role`, `isLoggedIn`, `isAdmin`, persisted to `localStorage`) and `CartContext` (real cart from the backend, `count`, `addToCart`/`removeFromCart`/`clear`; `addToCart` redirects to `/ingresar` when logged out). Consume them via `useAuth()` / `useCart()`. `src/hooks/useProducts.js` fetches the catalog.
- **Views** (`src/views/`): page-level components that fetch from the API layer. Public pages at the top level; admin pages under `src/views/admin/` nested in `<AdminLayout>` (sidebar layout using `<Outlet>`, guarded by `isAdmin`); user pages under `src/views/user/`; error pages under `src/views/errors/`. The catch-all `*` route renders `PageNotFound`. Catalog filters (game/set/rarity/price/sort) are derived from the fetched data and applied client-side; only search hits the backend (`/api/cards?search=`).
- **Components** (`src/components/`): feature components grouped in their own folders (`Navbar/`, `Footer/`, `ProductCard/`). Reusable design-system primitives live in `src/components/atoms/` (`Button`, `Badge`, `Price`, `Hero`, `ContainerBasic`). Use `ContainerBasic` for page-width content wrapping.

## Styling conventions

- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin (no PostCSS config). Design tokens are defined as CSS custom properties in `src/index.css` under `@theme` (and mirrored in `:root` for fallback). `tailwind.config.cjs` maps semantic color/font/shadow utilities to those variables.
- Colors are semantic tokens, not raw values: `primary`, `secondary` (gold `#D4AF37`), `accent` (silver), `neutral`, plus `info`/`success`/`error`/`warning` and `surface`/`surface-200`/`surface-300`. Each has a matching `-content` token for foreground text. Prefer these over arbitrary colors.
- The whole UI is intentionally **sharp-cornered**: `--radius-none: 0` and a global `* { border-radius: 0 }` reset in `index.css`. Don't add rounded corners.
- Fonts: `font-display` (Hanken Grotesk) for headings, `font-body` (Inter) for body text.
- Styling is applied two ways in this codebase, often mixed in the same component: Tailwind utility classes AND inline `style={{ color: 'var(--color-...)' }}` referencing the CSS variables. Match the surrounding file's approach when editing.

### Button/Badge color pattern

`Button` (and similar atoms) resolve color+variant through an explicit `colorClassMap` object holding full Tailwind class strings, rather than building class names dynamically. This exists so Tailwind's JIT scanner can see every class literally. When adding a new color or variant, add the complete class string to the map — do not construct class names by string interpolation (e.g. `` `bg-${color}` ``), as those won't be generated.

## Conventions

- Components are named exports written as arrow-function consts; atom files often also provide a `default` export, so both `import { Button }` and `import Button` appear. JSDoc prop blocks precede the main components.
- Rarity is modeled as an integer 1–5 mapped to label/color/variant via a local `rarityConfig` object; this map is duplicated in `ProductCard.jsx` and `ProductDetails.jsx`.
- File extensions are `.jsx`; this is plain JavaScript (no TypeScript).
