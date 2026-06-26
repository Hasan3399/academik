# Panduan Setup PostgreSQL untuk SIAKAD

## 📋 Perubahan dari MySQL ke PostgreSQL

Proyek ini telah dimigrasi dari MySQL ke PostgreSQL. Berikut adalah panduan lengkap untuk setup dan konfigurasi.

## ✅ Yang Sudah Berubah

### 1. **Database Configuration**
- ✅ `config/database.js` - Menggunakan PostgreSQL Pool
- ✅ `.env.example` - Konfigurasi PostgreSQL (port 5432)
- ✅ `schema.sql` - Semua syntax disesuaikan dengan PostgreSQL

### 2. **Routes yang Sudah Diupdate**
- ✅ `routes/auth.js` - Query PostgreSQL dengan parameterized queries
- ✅ `routes/mahasiswa.js` - CRUD dengan PostgreSQL
- ✅ `routes/mataKuliah.js` - CRUD dengan PostgreSQL
- ✅ `routes/nilai.js` - CRUD dengan JOIN queries PostgreSQL

### 3. **Server Configuration**
- ✅ `server.js` - Import database pool dan health check endpoint

## 🚀 Cara Setup

### Langkah 1: Install Dependencies
```bash
npm install
```

### Langkah 2: Setup PostgreSQL Database

#### Option A: Di Local Machine
```bash
# Install PostgreSQL (jika belum ada)
# Macbook: brew install postgresql
# Ubuntu: sudo apt-get install postgresql postgresql-contrib
# Windows: Download dari https://www.postgresql.org/download/windows/

# Start PostgreSQL service
# Macbook: brew services start postgresql
# Ubuntu: sudo service postgresql start
# Windows: Gunakan PostgreSQL installer

# Login ke PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE siakad;

# Keluar dari psql
\q
```

#### Option B: Menggunakan Docker
```bash
# Pull PostgreSQL image
docker pull postgres:15-alpine

# Run PostgreSQL container
docker run --name siakad_db \
  -e POSTGRES_DB=siakad \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15-alpine

# Verify container is running
docker ps
```

### Langkah 3: Setup Environment Variables

```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dengan konfigurasi PostgreSQL Anda
# Contoh:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=siakad
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=ganti_dengan_secret_key_yang_sangat_panjang_dan_acak_123456
PORT=3000
NODE_ENV=development
```

### Langkah 4: Initialize Database

```bash
# Login ke PostgreSQL
psql -U postgres -d siakad

# Jalankan schema file
\i schema.sql

# Verify tables dibuat
\dt

# Keluar
\q
```

Atau gunakan command line:
```bash
psql -U postgres -d siakad -f schema.sql
```

### Langkah 5: Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📝 API Endpoints

### Health Check
```
GET /api/health
Response: { status: 'ok', database: 'connected', timestamp: ... }
```

### Authentication
```
POST /api/auth/login
Body: { username, password }

GET /api/auth/me (require token)

POST /api/auth/register (admin only)
Body: { username, password, nama, email, role }

POST /api/auth/logout (require token)
```

### Mahasiswa
```
GET /api/mahasiswa - Get all
GET /api/mahasiswa/:id - Get by ID
POST /api/mahasiswa - Create new
PUT /api/mahasiswa/:id - Update
DELETE /api/mahasiswa/:id - Delete
```

### Mata Kuliah
```
GET /api/mata-kuliah - Get all
GET /api/mata-kuliah/:id - Get by ID
POST /api/mata-kuliah - Create new
PUT /api/mata-kuliah/:id - Update
DELETE /api/mata-kuliah/:id - Delete
```

### Nilai
```
GET /api/nilai - Get all
GET /api/nilai/:id - Get by ID
GET /api/nilai/mahasiswa/:mahasiswa_id - Get by mahasiswa
POST /api/nilai - Create new
PUT /api/nilai/:id - Update
DELETE /api/nilai/:id - Delete
```

## 🔐 Kredensial Default

### Admin
- Username: `admin`
- Password: `admin123`

### Dosen
- Username: `dosen1`
- Password: `admin123`

### Mahasiswa
- Username: `mhs001`
- Password: `admin123`

## 📊 Database Schema

### Tabel Users
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR UNIQUE)
- `password` (VARCHAR)
- `role` (ENUM: admin, dosen, mahasiswa)
- `nama` (VARCHAR)
- `email` (VARCHAR)
- `created_at` (TIMESTAMP)

### Tabel Mahasiswa
- `id` (SERIAL PRIMARY KEY)
- `nim` (VARCHAR UNIQUE)
- `nama` (VARCHAR)
- `email` (VARCHAR)
- `jurusan` (VARCHAR)
- `angkatan` (INTEGER)
- `jenis_kelamin` (ENUM: L, P)
- `no_hp` (VARCHAR)
- `alamat` (TEXT)
- `status` (ENUM: aktif, cuti, lulus, keluar)
- `user_id` (INTEGER FOREIGN KEY)
- `created_at` (TIMESTAMP)

### Tabel Mata Kuliah
- `id` (SERIAL PRIMARY KEY)
- `kode_mk` (VARCHAR UNIQUE)
- `nama_mk` (VARCHAR)
- `sks` (INTEGER)
- `semester` (INTEGER)
- `jurusan` (VARCHAR)
- `dosen_pengampu` (VARCHAR)
- `created_at` (TIMESTAMP)

### Tabel Nilai
- `id` (SERIAL PRIMARY KEY)
- `mahasiswa_id` (INTEGER FOREIGN KEY)
- `mata_kuliah_id` (INTEGER FOREIGN KEY)
- `semester` (VARCHAR)
- `tahun_ajaran` (VARCHAR)
- `nilai_angka` (NUMERIC)
- `nilai_huruf` (VARCHAR)
- `created_at` (TIMESTAMP)
- UNIQUE(mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran)

## 🔄 Migrasi dari MySQL (Jika Ada Data Lama)

### 1. Export dari MySQL
```bash
mysqldump -u root -p siakad > siakad_mysql.sql
```

### 2. Convert SQL Syntax ke PostgreSQL
- Ganti `AUTO_INCREMENT` dengan `SERIAL`
- Ganti `ENUM` MySQL dengan `CREATE TYPE` PostgreSQL
- Ganti `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` tetap sama
- Ganti function-specific syntax

### 3. Import ke PostgreSQL
```bash
psql -U postgres -d siakad -f siakad_converted.sql
```

## 🛠️ Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
**Solusi:**
- Pastikan PostgreSQL service sudah running
- Cek DB_HOST, DB_PORT di .env
- Jalankan: `sudo service postgresql start` (Linux) atau `brew services start postgresql` (Mac)

### Error: "password authentication failed"
**Solusi:**
- Cek DB_USER dan DB_PASSWORD di .env
- Reset password PostgreSQL: `ALTER USER postgres WITH PASSWORD 'new_password';`

### Error: "database siakad does not exist"
**Solusi:**
- Buat database: `CREATE DATABASE siakad;`
- Atau jalankan schema.sql: `psql -U postgres -d siakad -f schema.sql`

### Connection Pool Error
**Solusi:**
- Pastikan environment variables sudah benar di .env
- Cek log error di console
- Restart server: `npm run dev`

## 📓 Testing dengan Postman

### 1. Login
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "username": "admin",
  "password": "admin123"
}
```

### 2. Copy token dari response, gunakan di header:
```
Authorization: Bearer <token>
```

### 3. Get Mahasiswa
```
GET http://localhost:3000/api/mahasiswa
Header: Authorization: Bearer <token>
```

## 🔗 Database Connection String

Untuk Railway atau platform lain, gunakan:
```
postgresql://username:password@host:port/database
```

Contoh:
```
postgresql://postgres:password@localhost:5432/siakad
```

## 📚 Dokumentasi Berguna
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [Node.js pg module](https://node-postgres.com/)
- [Express.js Guide](https://expressjs.com/)

## ✨ Tips Pengembangan

1. **Selalu gunakan parameterized queries** untuk mencegah SQL injection
2. **Test semua endpoint** sebelum deploy
3. **Backup database** secara regular
4. **Monitor connection pool** untuk memory leak
5. **Gunakan transactions** untuk operasi multi-table

---

**Setup selesai! 🎉**

Jika ada pertanyaan atau error, cek log console dan troubleshooting section di atas.
