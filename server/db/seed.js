const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 8;

const seed = async () => {
    await pool.query('DROP TABLE IF EXISTS rsvps');
    await pool.query('DROP TABLE IF EXISTS events');
    await pool.query('DROP TABLE IF EXISTS users');

    await pool.query(`
        CREATE TABLE users (
            user_id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    `);

    await pool.query(`
        CREATE TABLE events (
            event_id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            location TEXT NOT NULL,
            event_type TEXT NOT NULL,
            max_capacity INTEGER NOT NULL,
            user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE
        )
    `);

    await pool.query(`
        CREATE TABLE rsvps (
            rsvp_id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
            UNIQUE (user_id, event_id)
        )
    `);

    // Hash passwords for seed data
    const serenaHash = await bcrypt.hash('pebble2', SALT_ROUNDS);
    const valerieHash = await bcrypt.hash('halcyon', SALT_ROUNDS);
    const gwenHash = await bcrypt.hash('swimmingly', SALT_ROUNDS);

    const insertUserSql = `
        INSERT INTO users 
        (username, password_hash) 
        VALUES ($1, $2) 
        RETURNING user_id;`;

    const serenaResponse = await pool.query(insertUserSql, ['serena', serenaHash]);
    const valerieResponse = await pool.query(insertUserSql, ['valerie', valerieHash]);
    const gwenResponse = await pool.query(insertUserSql, ['gwen', gwenHash]);

    const serenaId = serenaResponse.rows[0].user_id;
    const valerieId = valerieResponse.rows[0].user_id;
    const gwenId = gwenResponse.rows[0].user_id;

    const eventsQuery = `
        INSERT INTO events 
        (title, description, date, location, event_type, max_capacity, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING event_id;
    `;

    await pool.query(eventsQuery, [
        'Tech Conference 2026',
        'A large conference for developers and tech enthusiasts',
        '2026-06-15',
        'New York',
        'conference',
        300,
        1
    ]);

    await pool.query(eventsQuery, [
        'JavaScript Bootcamp',
        'Hands-on workshop to learn modern JavaScript',
        '2026-06-20',
        'Online',
        'workshop',
        50,
        2
    ]);

    await pool.query(eventsQuery, [
        'Summer Music Fest',
        'Outdoor concert featuring multiple artists',
        '2026-07-10',
        'Los Angeles',
        'concert',
        500,
        1
    ]);

    await pool.query(eventsQuery, [
        'Startup Networking Night',
        'Meet founders, investors, and developers',
        '2026-06-25',
        'San Francisco',
        'networking',
        150,
        3
    ]);

    await pool.query(eventsQuery, [
        'Charity Run',
        '5K run to raise funds for local charities',
        '2026-08-01',
        'Chicago',
        'fundraiser',
        200,
        2
    ]);

    const rsvpsQuery = `
        INSERT INTO rsvps (user_id, event_id)
        VALUES ($1, $2)
    `;

    await pool.query(rsvpsQuery, [serenaId, 2]);
    await pool.query(rsvpsQuery, [serenaId, 4]);

    await pool.query(rsvpsQuery, [valerieId, 1]);
    await pool.query(rsvpsQuery, [valerieId, 3]);

    await pool.query(rsvpsQuery, [gwenId, 1]);
    await pool.query(rsvpsQuery, [gwenId, 5]);

    console.log('Database seeded.');
}

seed()
    .catch((err) => {
        console.error('Error seeding database:', err);
        process.exit(1);
    })
    .finally(() => pool.end());