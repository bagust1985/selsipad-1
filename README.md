# SELSIPAD

**Multi-chain Launchpad Platform** untuk EVM dan Solana.

## Tentang SELSIPAD

SELSIPAD adalah platform launchpad yang mendukung berbagai jenis token sale:
- **Presale Pool**: Fixed-price token presale
- **Fairlaunch Pool**: Proportional allocation tanpa early bird advantage
- **Bonding Curve**: Continuous price discovery mechanism

### Fitur Utama
- Multi-network support (BSC, Ethereum, Solana, dan lainnya)
- Liquidity lock untuk keamanan investor
- Vesting system untuk distribusi bertahap
- SelsiFeed untuk project updates
- Badge system dan rewards

## Struktur Repository

```
selsipad/
├── apps/              # User-facing applications
│   ├── web/          # Main web application
│   └── admin/        # Admin dashboard
├── services/         # Backend services
│   ├── indexer_evm/  # EVM chain event indexer
│   ├── indexer_sol/  # Solana program indexer
│   ├── worker/       # Background job processor
│   └── tx_manager/   # Transaction management
├── packages/         # Shared libraries
│   ├── ui/          # React components
│   ├── sdk/         # TypeScript SDK
│   ├── chains/      # Chain configs & ABIs
│   └── config/      # Shared configuration
├── supabase/        # Database & backend
│   ├── functions/   # Edge functions
│   ├── migrations/  # SQL migrations
│   ├── policies/    # RLS policies
│   └── seed/        # Seed data
└── docs/            # Documentation
    ├── modul/       # Module documentation (01-16)
    ├── roadmap/     # Development roadmap
    └── task/        # Task management & ADRs
```

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9.0.0+

### Installation

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev
```

Aplikasi akan tersedia di:
- Web: http://localhost:3000
- Admin: http://localhost:3001

### Available Scripts

```bash
pnpm dev         # Start all apps in development mode
pnpm build       # Build all apps for production
pnpm lint        # Lint all packages
pnpm typecheck   # Type check all packages
pnpm format      # Format code with Prettier
```

## Environment Variables

Copy `.env.example` ke `.env.local` di setiap app dan isi dengan values yang sesuai:

```bash
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Add more as needed
```

## Documentation

Dokumentasi lengkap tersedia di folder [`docs/`](./docs/):
- [Module Documentation](./docs/modul/README.md) - Detail 16 modul
- [Roadmap](./docs/roadmap/2026-q1.md) - Development roadmap
- [ADRs](./docs/task/decisions/) - Architecture decisions

## Development

### Tech Stack
- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Blockchain**: Solidity (EVM), Anchor (Solana)
- **Monorepo**: Turborepo + pnpm
- **Language**: TypeScript

### Monorepo Structure
Menggunakan Turborepo untuk build orchestration dan pnpm workspaces untuk dependency management. Lihat [ADR-0001](./docs/task/decisions/adr-0001-monorepo-turborepo.md) untuk details.

## Contributing

TBD

## License

TBD

## Contact

- Website: [Coming Soon]
- Twitter: [Coming Soon]
- Discord: [Coming Soon]
