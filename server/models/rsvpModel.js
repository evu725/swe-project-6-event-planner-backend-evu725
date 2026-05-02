const pool = require("../db/pool");

module.exports.rsvp = async (user_id, event_id) => {
    const query = `
        INSERT INTO rsvps (user_id, event_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [user_id, event_id]);
    return rows[0] || null;
};

module.exports.unrsvp = async (user_id, event_id) => {
    const query = `
        DELETE FROM rsvps
        WHERE user_id = $1 AND event_id = $2
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [user_id, event_id]);
    return rows[0] || null;
};

module.exports.listByUser = async (user_id) => {
    const query = `
        SELECT event_id
        FROM rsvps
        WHERE user_id = $1;
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows.map(r => r.event_id);
};

module.exports.listByEvent = async (event_id) => {
    const query = `
        SELECT users.user_id, users.username
        FROM rsvps
        JOIN users ON rsvps.user_id = users.user_id
        WHERE rsvps.event_id = $1;
    `;
    const { rows } = await pool.query(query, [event_id]);
    return rows;
};
