const eventModel = require('../models/eventModel');

// GET /api/events
const listEvents = async (req, res, next) => {
    try {
        const events = await eventModel.list();
        res.send(events);
    } catch (err) {
        next(err);
    }
};

// GET /api/users/:user_id/events
const listUserEvents = async (req, res, next) => {
    try {
        const userId = Number(req.params.user_id);
        const events = await eventModel.listByUser(userId);
        res.send(events);
    } catch (err) {
        next(err);
    }
};

// POST /api/events
const createEvent = async (req, res, next) => {
    try {
        if (!req.session.userId) {
        return res.status(401).send({ message: 'Not logged in' });
        }

        const { title, description, date, location, event_type, max_capacity } = req.body;

        if (!title || !date || !location || !event_type || !max_capacity) {
        return res.status(400).send({ message: 'Missing required fields' });
        }

        const validTypes = ['workshop', 'social', 'conference'];
        if (!validTypes.includes(event_type)) {
        return res.status(400).send({ message: 'Invalid event_type' });
        }

        const event = await eventModel.create(
            title,
            description,
            date,
            location,
            event_type,
            max_capacity,
            req.session.userId
        );

        res.status(201).send(event);
    } catch (err) {
        next(err);
    }
};

// PATCH /api/events/:event_id
const updateEvent = async (req, res, next) => {
    try {
        const eventId = Number(req.params.event_id);

        if (!req.session.userId) {
            return res.status(401).send({ message: 'Not logged in' });
        }

        const existing = await eventModel.find(eventId);
        if (!existing) {
            return res.status(404).send({ message: 'Event not found' });
        }

        if (existing.user_id !== req.session.userId) {
            return res.status(403).send({ message: 'You can only update your own events.' });
        }

        const { title, description, date, location, event_type, max_capacity } = req.body;

        if (!title && !description && !date && !location && !event_type && !max_capacity) {
            return res.status(400).send({ message: 'No fields to update' });
        }

        const event = await eventModel.update(
            eventId,
            title,
            description,
            date,
            location,
            event_type,
            max_capacity
        );

        res.send(event);
    } catch (err) {
        next(err);
    }
};

// DELETE /api/events/:event_id
const deleteEvent = async (req, res, next) => {
    try {
        const eventId = Number(req.params.event_id);

        if (!req.session.userId) {
            return res.status(401).send({ message: 'Not logged in' });
        }

        const existing = await eventModel.find(eventId);
        if (!existing) {
            return res.status(404).send({ message: 'Event not found' });
        }

        // 403 — not owner
        if (existing.user_id !== req.session.userId) {
            return res.status(403).send({ message: 'You can only delete your own events.' });
        }

        const event = await eventModel.destroy(eventId);
        res.send(event);
    } catch (err) {
        next(err);
    }
};

module.exports = { listEvents, listUserEvents, createEvent, updateEvent, deleteEvent };
