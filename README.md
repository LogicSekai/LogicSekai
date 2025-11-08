# Logic Sekai - Authentication System

Platform untuk berbagi logic dan pengetahuan programming dengan sistem autentikasi yang robust.

## Tech Stack

- **Frontend**: Nuxt v4, Vue 3, TypeScript
- **UI Components**: shadcn-vue, Tailwind CSS, Lucide Vue Next
- **Authentication**: Better Auth
- **Database**: Drizzle ORM dengan Cloudflare D1
- **Deployment**: Cloudflare Pages
- **Package Manager**: Bun

## Features

- ✅ User Registration & Login
- ✅ Password Hashing (bcrypt)
- ✅ Role-based Authorization (user/creator/superadmin)
- ✅ Form Validation (Zod + VeeValidate)
- ✅ Responsive Design
- ✅ Type Safety
- ✅ Database Migrations

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Configuration

Salin file `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Update variabel environment di file `.env`:

```env
# Database Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_database_id  
CLOUDFLARE_API_TOKEN=your_api_token

# Authentication
BETTER_AUTH_SECRET=your-super-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

### 3. Database Setup

#### Development (SQLite)
Untuk development lokal, gunakan SQLite:

```bash
# Generate migration files
bun run db:generate

# Apply migrations (untuk production dengan D1)
bun run db:migrate
```

#### Production (Cloudflare D1)
Untuk production dengan Cloudflare D1:

```bash
# Login ke Cloudflare
bunx wrangler login

# Buat database D1
bunx wrangler d1 create logic-sekai-db

# Update wrangler.toml dengan database_id yang diberikan
# Jalankan migrations
bunx wrangler d1 migrations apply logic-sekai-db --local
```

### 4. Development Server

```bash
bun run dev
```

Server akan berjalan di `http://localhost:3000`.

## Database Schema

### Users Table

| Column   | Type      | Constraints                    |
|----------|-----------|--------------------------------|
| id       | TEXT      | PRIMARY KEY (CUID)             |
| username | TEXT      | NOT NULL, UNIQUE               |
| name     | TEXT      | NOT NULL                       |
| email    | TEXT      | NOT NULL, UNIQUE               |
| password | TEXT      | NOT NULL (bcrypt hashed)       |
| avatar   | TEXT      | NULL                           |
| role     | TEXT      | DEFAULT 'user'                 |
| verified | BOOLEAN   | DEFAULT false                  |
| created  | TIMESTAMP | NOT NULL                       |
| updated  | TIMESTAMP | NOT NULL                       |

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/[...all]` - Better Auth endpoints

## Routes

- `/` - Homepage (menampilkan profil jika login)
- `/auth/login` - Halaman login
- `/auth/register` - Halaman registrasi

## Production Deployment

### 1. Build untuk Cloudflare Pages

```bash
bun run build
```

### 2. Deploy ke Cloudflare Pages

```bash
bun run deploy
```

### 3. Environment Variables di Cloudflare

Set environment variables di Cloudflare Pages dashboard:
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_DATABASE_ID` 
- `CLOUDFLARE_API_TOKEN`

## Development Commands

```bash
# Generate database migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio

# Build for production
bun run build

# Preview production build
bun run preview

# Deploy to Cloudflare Pages
bun run deploy
```

## Security Features

- Password hashing menggunakan bcrypt
- CUID untuk primary keys (collision resistant)
- Input validation menggunakan Zod
- XSS protection melalui Vue
- Type safety dengan TypeScript

## Struktur Project

```
app/
├── assets/css/         # Tailwind CSS
├── components/ui/      # shadcn-vue components  
├── composables/        # Vue composables
├── lib/
│   ├── auth/          # Authentication config
│   └── db/            # Database schema & config
├── middleware/        # Route middleware
├── pages/             # Nuxt pages
└── plugins/           # Nuxt plugins

server/
└── api/auth/          # API endpoints

drizzle.config.ts      # Drizzle ORM config
wrangler.toml          # Cloudflare config
nuxt.config.ts         # Nuxt config
```

## Troubleshooting

### Database Issues
- Pastikan Cloudflare D1 database sudah dibuat
- Cek connection string dan credentials
- Verifikasi migration files

### Authentication Issues  
- Cek BETTER_AUTH_SECRET di environment
- Pastikan BASE_URL sesuai dengan deployment
- Verifikasi password hashing

### Build Issues
- Clear `.nuxt` dan `.output` directories
- Regenerate types dengan `nuxt prepare`
- Update dependencies

## Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## License

MIT License
