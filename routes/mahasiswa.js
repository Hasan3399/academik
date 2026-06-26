const { query } = require('../config/database');
const express = require('express');
const router = express.Router();

// Get all mahasiswa
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, nim, nama, email, jurusan, angkatan, jenis_kelamin, status FROM mahasiswa ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Get mahasiswa by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM mahasiswa WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mahasiswa tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Create mahasiswa
router.post('/', async (req, res) => {
  try {
    const { nim, nama, email, jurusan, angkatan, jenis_kelamin } = req.body;

    if (!nim || !nama) {
      return res.status(400).json({ error: 'NIM dan nama harus diisi' });
    }

    const result = await query(
      'INSERT INTO mahasiswa (nim, nama, email, jurusan, angkatan, jenis_kelamin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nim, nama, email, jurusan, angkatan, jenis_kelamin]
    );

    res.status(201).json({
      message: 'Mahasiswa berhasil ditambahkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'NIM sudah terdaftar' });
    } else {
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  }
});

// Update mahasiswa
router.put('/:id', async (req, res) => {
  try {
    const { nama, email, jurusan, angkatan, jenis_kelamin, status } = req.body;

    const result = await query(
      'UPDATE mahasiswa SET nama = $1, email = $2, jurusan = $3, angkatan = $4, jenis_kelamin = $5, status = $6 WHERE id = $7 RETURNING *',
      [nama, email, jurusan, angkatan, jenis_kelamin, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mahasiswa tidak ditemukan' });
    }

    res.json({
      message: 'Mahasiswa berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Delete mahasiswa
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM mahasiswa WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mahasiswa tidak ditemukan' });
    }

    res.json({ message: 'Mahasiswa berhasil dihapus' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

module.exports = router;
