# Sellify Frontend

Modern e-commerce + admin frontend for the Sellify backend.

**Stack:** React 18 · Vite · TypeScript · Tailwind CSS · Redux Toolkit + RTK Query · React Router 6 · Recharts · Sonner · Lucide

## Getting Started

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL if backend isn't on localhost:5000
npm run dev
```

Open http://localhost:5173

> The backend already whitelists `http://localhost:5173` in its CORS config, so no extra setup is needed.

## Routes

### Storefront (customer)
| Path | Page |
|---|---|
| `/` | Home (hero + categories + featured) |
| `/shop` | Catalog with search & category filter |
| `/shop/products/:id` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Stripe checkout (auth required) |
| `/checkout/success` | Post-payment success |
| `/checkout/cancel` | Payment cancelled |
| `/login`, `/register` | Customer auth |
| `/account/orders` | My orders |
| `/account/profile` | Customer profile |

### Admin (staff)
| Path | Page |
|---|---|
| `/admin/login` | Admin sign in |
| `/admin/overview` | Dashboard with KPIs and chart |
| `/admin/products` | Product CRUD with image upload |
| `/admin/categories` | Category CRUD |
| `/admin/orders` | All orders |
| `/admin/orders/new` | POS checkout flow |
| `/admin/orders/:id` | Order detail with status updates |
| `/admin/customers` | Customer CRUD |
| `/admin/payments` | Payment history |
| `/admin/users` | Staff management (admin only) |
| `/admin/settings` | Profile + password |

## Folder Structure

```
src/
├── api/            # RTK Query (one file per resource)
├── app/            # Redux store + typed hooks
├── components/     # Reusable UI primitives (Button, Table, Modal, ...)
│   ├── ui/
│   ├── layout/
│   └── forms/
├── features/       # Slices: auth, customerAuth, cart, theme
├── hooks/
├── layouts/        # AdminLayout, ShopLayout, AuthLayout
├── lib/            # utils, format, storage, constants
├── pages/
│   ├── admin/
│   ├── shop/
│   └── auth/
├── routes/         # Route guards (Protected*, RoleGate)
├── types/          # Shared TS types mirroring backend models
├── App.tsx
├── main.tsx
├── router.tsx
└── index.css
```

## Theming

- `darkMode: 'class'` Tailwind config
- CSS variables in `src/index.css` define `--bg`, `--surface`, `--border`, `--text`, `--muted` for light & dark
- Tailwind maps these to `bg`, `surface`, `border`, `text`, `muted` color tokens
- Blue (`primary-50` … `primary-950`) is the brand color
- Theme persists in `localStorage` via `themeSlice`; toggle in the top bar

## Authentication

Two independent JWT realms:

- **Admin** — `/api/auth/*`, token stored under `sellify_admin_auth`
- **Customer** — `/api/customers/auth/*`, token stored under `sellify_customer_auth`

`baseApi` injects the right token per request based on the endpoint's `extraOptions: { realm: 'admin' | 'customer' | 'public' }` and auto-refreshes on 401.

## Adding a new resource

1. Add types in `src/types/<resource>.ts`
2. Create `src/api/<resource>Api.ts` with `baseApi.injectEndpoints({ ... })`
3. Build pages under `src/pages/admin/<resource>/` (or `shop/`)
4. Wire routes in `src/router.tsx`
5. Add a sidebar entry in `src/layouts/AdminLayout.tsx` if it should be navigable

The reusable `<Table>`, `<Card>`, `<Modal>`, `<Input>`, `<Select>`, `<Button>`, `<Pagination>`, `<EmptyState>` and `<Badge>` components keep new pages consistent with minimal effort.
