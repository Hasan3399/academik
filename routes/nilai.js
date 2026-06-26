const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminOrDosen } = require('../config/middleware');

// GET semua nilai dengan join
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, m.nim, m.nama as nama_mahasiswa, mk.kode_mk, mk.nama_mk, mk.sks
      FROM nilai n
      JOIN mahasiswa m ON n.mahasiswa_id = m.id
      JOIN mata_kuliah mk ON n.mata_kuliah_id = mk.id
      ORDER BY m.nim, mk.kode_mk
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah nilai - admin or dosen only
router.post('/', authMiddleware, adminOrDosen, async (req, res) => {
  const { mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran, nilai_angka } = req.body;
  
  // Konversi nilai angka ke huruf
  let nilai_huruf = 'E';
  if (nilai_angka >= 85) nilai_huruf = 'A';
  else if (nilai_angka >= 80) nilai_huruf = 'A-';
  else if (nilai_angka >= 75) nilai_huruf = 'B+';
  else if (nilai_angka >= 70) nilai_huruf = 'B';
  else if (nilai_angka >= 65) nilai_huruf = 'B-';
  else if (nilai_angka >= 60) nilai_huruf = 'C+';
  else if (nilai_angka >= 55) nilai_huruf = 'C';
  else if (nilai_angka >= 40) nilai_huruf = 'D';

  try {
    const [result] = await db.query(
      'INSERT INTO nilai (mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran, nilai_angka, nilai_huruf) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran, nilai_angka, nilai_huruf]
    );
    res.status(201).json({ id: result[0].id, nilai_huruf, message: 'Nilai berhasil ditambahkan' });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Nilai untuk MK ini sudah ada di semester tersebut' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update nilai - admin or dosen only
router.put('/:id', authMiddleware, adminOrDosen, async (req, res) => {
  const { nilai_angka, semester, tahun_ajaran } = req.body;
  
  let nilai_huruf = 'E';
  if (nilai_angka >= 85) nilai_huruf = 'A';
  else if (nilai_angka >= 80) nilai_huruf = 'A-';
  else if (nilai_angka >= 75) nilai_huruf = 'B+';
  else if (nilai_angka >= 70) nilai_huruf = 'B';
  else if (nilai_angka >= 65) nilai_huruf = 'B-';
  else if (nilai_angka >= 60) nilai_huruf = 'C+';
  else if (nilai_angka >= 55) nilai_huruf = 'C';
  else if (nilai_angka >= 40) nilai_huruf = 'D';

  try {
    await db.query(
      'UPDATE nilai SET nilai_angka=$1, nilai_huruf=$2, semester=$3, tahun_ajaran=$4 WHERE id=$5',
      [nilai_angka, nilai_huruf, semester, tahun_ajaran, req.params.id]
    );
    res.json({ message: 'Nilai berhasil diperbarui', nilai_huruf });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, adminOrDosen, async (req, res) => {
  try {
    await db.query('DELETE FROM nilai WHERE id = $1', [req.params.id]);
    res.json({ message: 'Nilai berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET statistik untuk dashboard
router.get('/statistik/ringkasan', authMiddleware, async (req, res) => {
  try {
    const [mhsRows] = await db.query('SELECT COUNT(*) as total_mhs FROM mahasiswa');
    const [mkRows] = await db.query('SELECT COUNT(*) as total_mk FROM mata_kuliah');
    const [nilaiRows] = await db.query('SELECT COUNT(*) as total_nilai FROM nilai');
    const [avgRows] = await db.query('SELECT AVG(nilai_angka) as rata_nilai FROM nilai');

    const [dist] = await db.query(`
      SELECT nilai_huruf, COUNT(*) as jumlah
      FROM nilai
      GROUP BY nilai_huruf
      ORDER BY nilai_huruf
    `);

    const [per_jurusan] = await db.query(`
      SELECT jurusan, COUNT(*) as jumlah
      FROM mahasiswa
      GROUP BY jurusan
    `);

    res.json({
      total_mahasiswa: parseInt(mhsRows[0].total_mhs, 10),
      total_mata_kuliah: parseInt(mkRows[0].total_mk, 10),
      total_nilai: parseInt(nilaiRows[0].total_nilai, 10),
      rata_rata_nilai: avgRows[0].rata_nilai ? parseFloat(avgRows[0].rata_nilai).toFixed(2) : 0,
      distribusi_nilai: dist,
      mahasiswa_per_jurusan: per_jurusan
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
