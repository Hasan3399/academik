-- ============================================
-- SIAKAD - Sistem Informasi Akademik
-- Schema Database PostgreSQL
-- Jalankan file ini sekali untuk setup awal
-- ============================================

-- Drop tables jika sudah ada (untuk reset)
DROP TABLE IF EXISTS nilai CASCADE;
DROP TABLE IF EXISTS mata_kuliah CASCADE;
DROP TABLE IF EXISTS mahasiswa CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create ENUM types
CREATE TYPE role_type AS ENUM ('admin', 'dosen', 'mahasiswa');
CREATE TYPE jenis_kelamin_type AS ENUM ('L', 'P');
CREATE TYPE status_mahasiswa_type AS ENUM ('aktif', 'cuti', 'lulus', 'keluar');

-- Buat tabel users (untuk login)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role role_type NOT NULL DEFAULT 'mahasiswa',
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel mahasiswa
CREATE TABLE mahasiswa (
  id SERIAL PRIMARY KEY,
  nim VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  jurusan VARCHAR(100),
  angkatan INTEGER,
  jenis_kelamin jenis_kelamin_type,
  no_hp VARCHAR(20),
  alamat TEXT,
  status status_mahasiswa_type DEFAULT 'aktif',
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel mata kuliah
CREATE TABLE mata_kuliah (
  id SERIAL PRIMARY KEY,
  kode_mk VARCHAR(20) UNIQUE NOT NULL,
  nama_mk VARCHAR(100) NOT NULL,
  sks INTEGER NOT NULL DEFAULT 2,
  semester INTEGER,
  jurusan VARCHAR(100),
  dosen_pengampu VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel nilai
CREATE TABLE nilai (
  id SERIAL PRIMARY KEY,
  mahasiswa_id INTEGER NOT NULL REFERENCES mahasiswa(id) ON DELETE CASCADE,
  mata_kuliah_id INTEGER NOT NULL REFERENCES mata_kuliah(id) ON DELETE CASCADE,
  semester VARCHAR(20),
  tahun_ajaran VARCHAR(20),
  nilai_angka NUMERIC(5,2),
  nilai_huruf VARCHAR(5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran)
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_mahasiswa_nim ON mahasiswa(nim);
CREATE INDEX idx_mahasiswa_user_id ON mahasiswa(user_id);
CREATE INDEX idx_mata_kuliah_kode ON mata_kuliah(kode_mk);
CREATE INDEX idx_nilai_mahasiswa ON nilai(mahasiswa_id);
CREATE INDEX idx_nilai_mata_kuliah ON nilai(mata_kuliah_id);

-- ============================================
-- DATA AWAL (Seed Data)
-- ============================================

-- Admin user (password: admin123)
INSERT INTO users (username, password, role, nama, email) VALUES
('admin', '$2a$10$MES29SSVFcdqfv917IE9deQ90lA3MgREZHtNEvhebgMTZSWcTFco2', 'admin', 'Administrator', 'admin@siakad.ac.id'),
('dosen1', '$2a$10$MES29SSVFcdqfv917IE9deQ90lA3MgREZHtNEvhebgMTZSWcTFco2', 'dosen', 'Dr. Budi Santoso', 'budi@siakad.ac.id'),
('mhs001', '$2a$10$MES29SSVFcdqfv917IE9deQ90lA3MgREZHtNEvhebgMTZSWcTFco2', 'mahasiswa', 'Andi Pratama', 'andi@mahasiswa.ac.id')
ON CONFLICT (username) DO NOTHING;

-- Mahasiswa contoh
INSERT INTO mahasiswa (nim, nama, email, jurusan, angkatan, jenis_kelamin, status, user_id) VALUES
('2021001', 'Andi Pratama', 'andi@mahasiswa.ac.id', 'Teknik Informatika', 2021, 'L', 'aktif', 3),
('2021002', 'Siti Rahayu', 'siti@mahasiswa.ac.id', 'Teknik Informatika', 2021, 'P', 'aktif', NULL),
('2021003', 'Budi Setiawan', 'budi.s@mahasiswa.ac.id', 'Sistem Informasi', 2021, 'L', 'aktif', NULL),
('2022001', 'Dewi Anggraini', 'dewi@mahasiswa.ac.id', 'Teknik Informatika', 2022, 'P', 'aktif', NULL),
('2022002', 'Rizki Fadhillah', 'rizki@mahasiswa.ac.id', 'Sistem Informasi', 2022, 'L', 'aktif', NULL)
ON CONFLICT (nim) DO NOTHING;

-- Mata kuliah contoh
INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, semester, jurusan, dosen_pengampu) VALUES
('IF101', 'Pengantar Algoritma', 3, 1, 'Teknik Informatika', 'Dr. Budi Santoso'),
('IF102', 'Matematika Diskrit', 2, 1, 'Teknik Informatika', 'Dr. Sari Dewi'),
('IF201', 'Pemrograman Web', 3, 3, 'Teknik Informatika', 'Dr. Budi Santoso'),
('IF202', 'Basis Data', 3, 3, 'Teknik Informatika', 'Dr. Ahmad Yani'),
('SI101', 'Sistem Informasi Manajemen', 3, 1, 'Sistem Informasi', 'Dr. Rini Susanti'),
('IF301', 'Cloud Computing', 3, 5, 'Teknik Informatika', 'Dr. Budi Santoso')
ON CONFLICT (kode_mk) DO NOTHING;

-- Nilai contoh
INSERT INTO nilai (mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran, nilai_angka, nilai_huruf) VALUES
(1, 1, 'Ganjil', '2021/2022', 85.00, 'A'),
(1, 2, 'Ganjil', '2021/2022', 78.00, 'B+'),
(1, 3, 'Ganjil', '2022/2023', 90.00, 'A'),
(2, 1, 'Ganjil', '2021/2022', 75.00, 'B'),
(2, 2, 'Ganjil', '2021/2022', 82.00, 'A-'),
(3, 5, 'Ganjil', '2021/2022', 88.00, 'A')
ON CONFLICT DO NOTHING;
