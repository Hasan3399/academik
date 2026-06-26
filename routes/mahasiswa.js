const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../config/middleware');

// GET semua mahasiswa
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM mahasiswa ORDER BY nim');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET satu mahasiswa
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM mahasiswa WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Mahasiswa tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah mahasiswa - admin only
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { nim, nama, email, jurusan, angkatan, jenis_kelamin, no_hp, alamat, status } = req.body;
  if (!nim || !nama) return res.status(400).json({ error: 'NIM dan nama wajib diisi' });
  try {
    const [result] = await db.query(
      'INSERT INTO mahasiswa (nim, nama, email, jurusan, angkatan, jenis_kelamin, no_hp, alamat, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
      [nim, nama, email, jurusan, angkatan, jenis_kelamin, no_hp, alamat, status || 'aktif']
    );
    res.status(201).json({ id: result[0].id, message: 'Mahasiswa berhasil ditambahkan' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'NIM sudah terdaftar' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update mahasiswa - admin only
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { nim, nama, email, jurusan, angkatan, jenis_kelamin, no_hp, alamat, status } = req.body;
  try {
    await db.query(
      'UPDATE mahasiswa SET nim=$1, nama=$2, email=$3, jurusan=$4, angkatan=$5, jenis_kelamin=$6, no_hp=$7, alamat=$8, status=$9 WHERE id=$10',
      [nim, nama, email, jurusan, angkatan, jenis_kelamin, no_hp, alamat, status, req.params.id]
    );
    res.json({ message: 'Mahasiswa berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE hapus mahasiswa - admin only
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM mahasiswa WHERE id = $1', [req.params.id]);
    res.json({ message: 'Mahasiswa berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
