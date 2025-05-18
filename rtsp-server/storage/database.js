// storage/database.js (PostgreSQL)
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'root',
    port: 5432,
});

async function addClip(clipData) {
    const { camera_id, camera_name, template_name, created_at, score, clip_url } = clipData;

    const result = await pool.query(
        `INSERT INTO clips (camera_id, camera_name, template_name, created_at, score, clip_url)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [camera_id, camera_name, template_name, created_at, score, clip_url]
    );

    return result.rows[0].id;
}

async function addCamera(cameraData) {
    const { name, source } = cameraData;

    const result = await pool.query(
        `INSERT INTO cameras (name, source)
     VALUES ($1, $2) RETURNING id`,
        [name, source]
    );

    return result.rows[0].id;
}

async function getClips() {
    const result = await pool.query('SELECT * FROM clips ORDER BY created_at DESC');
    return result.rows;
}

async function getCameras() {
    const result = await pool.query('SELECT * FROM cameras ORDER BY created_at DESC');
    return result.rows;
}

async function getClipById(id) {
    const result = await pool.query('SELECT * FROM clips WHERE id = $1', [id]);
    return result.rows[0];
}

async function getCameraById(id) {
    const result = await pool.query('SELECT * FROM cameras WHERE id = $1', [id]);
    return result.rows[0];
}

module.exports = {
    addClip,
    getClips,
    getClipById,
    getCameras,
    addCamera,
    getCameraById
};