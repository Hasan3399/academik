const { query } = require('../config/database');
const express = require('express');
const router = express.Router();

// Get all nilai
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT n.id, n.mahasiswa_id, n.mata_kuliah_id, n.semester, n.tahun_ajaran, 
              n.nilai_angka, n.nilai_huruf, m.nim, m.nama, mk.kode_mk, mk.nama_mk
       FROM nilai n
       JOIN mahasiswa m ON n.mahasiswa_id = m.id
       JOIN mata_kuliah mk ON n.mata_kuliah_id = mk.id
       ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Get nilai by mahasiswa ID
router.get('/mahasiswa/:mahasiswa_id', async (req, res) => {
  try {
    const result = await query(
      `SELECT n.id, n.semester, n.tahun_ajaran, n.nilai_angka, n.nilai_huruf, 
              mk.kode_mk, mk.nama_mk, mk.sks
       FROM nilai n
       JOIN mata_kuliah mk ON n.mata_kuliah_id = mk.id
       WHERE n.mahasiswa_id = $1
       ORDER BY n.tahun_ajaran DESC, n.semester DESC`,
      [req.params.mahasiswa_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Get nilai by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT n.*, m.nim, m.nama, mk.kode_mk, mk.nama_mk, mk.sks
       FROM nilai n
       JOIN mahasiswa m ON n.mahasiswa_id = m.id
       JOIN mata_kuliah mk ON n.mata_kuliah_id = mk.id
       WHERE n.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nilai tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Create nilai
router.post('/', async (req, res) => {
  try {
    const { mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran, nilai_angka, nilai_huruf } = req.body;

    if (!mahasiswa_id || !mata_kuliah_id || !nilai_angka) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const result = await query(
      `INSERT INTO nilai (mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran, nilai_angka, nilai_huruf)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran, nilai_angka, nilai_huruf]
    );

    res.status(201).json({
      message: 'Nilai berhasil ditambahkan',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Nilai untuk kombinasi ini sudah ada' });
    } else {
      res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  }
});

// Update nilai
router.put('/:id', async (req, res) => {
  try {
    const { nilai_angka, nilai_huruf } = req.body;

    const result = await query(
      'UPDATE nilai SET nilai_angka = $1, nilai_huruf = $2 WHERE id = $3 RETURNING *',
      [nilai_angka, nilai_huruf, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nilai tidak ditemukan' });
    }

    res.json({
      message: 'Nilai berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// Delete nilai
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM nilai WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nilai tidak ditemukan' });
    }

    res.json({ message: 'Nilai berhasil dihapus' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

module.exports = router;