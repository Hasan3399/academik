const { query } = require('../config/database');
const express = require('express');
const router = express.Router();

// Get all mata kuliah
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, kode_mk, nama_mk, sks, semester, jurusan, dosen_pengampu FROM mata_kuliah ORDER BY kode_mk'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Get mata kuliah by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM mata_kuliah WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mata kuliah tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Create mata kuliah
router.post('/', async (req, res) => {
  try {
    const { kode_mk, nama_mk, sks, semester, jurusan, dosen_pengampu } = req.body;

    if (!kode_mk || !nama_mk) {
      return res.status(400).json({ error: 'Kode MK dan nama MK harus diisi' });
    }

    const result = await query(
      'INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, semester, jurusan, dosen_pengampu) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [kode_mk, nama_mk, sks, semester, jurusan, dosen_pengampu]
    );

    res.status(201).json({
      message: 'Mata kuliah berhasil ditambahkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Kode MK sudah terdaftar' });
    } else {
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  }
});

// Update mata kuliah
router.put('/:id', async (req, res) => {
  try {
    const { nama_mk, sks, semester, jurusan, dosen_pengampu } = req.body;

    const result = await query(
      'UPDATE mata_kuliah SET nama_mk = $1, sks = $2, semester = $3, jurusan = $4, dosen_pengampu = $5 WHERE id = $6 RETURNING *',
      [nama_mk, sks, semester, jurusan, dosen_pengampu, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mata kuliah tidak ditemukan' });
    }

    res.json({
      message: 'Mata kuliah berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Delete mata kuliah
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM mata_kuliah WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mata kuliah tidak ditemukan' });
    }

    res.json({ message: 'Mata kuliah berhasil dihapus' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

module.exports = router;