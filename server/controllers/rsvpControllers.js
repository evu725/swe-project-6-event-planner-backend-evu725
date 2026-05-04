const rsvpModel = require('../models/rsvpModel');
const eventModel = require('../models/eventModel');

// POST /api/events/:event_id/rsvps
const createRsvp = async (req, res, next) => {
    try {
        if (!req.session.userId) {
        return res.status(401).send({ message: 'Not logged in' });
        }

        const eventId = Number(req.params.event_id);
        const userId = req.session.userId;

        const rsvp = await rsvpModel.rsvp(userId, eventId);

        res.status(201).send(rsvp || null);
    } catch (err) {
        next(err);
    }
};

// DELETE /api/events/:event_id/rsvps
const deleteRsvp = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).send({ message: 'Not logged in' });
        }

        const eventId = Number(req.params.event_id);
        const userId = req.session.userId;

        const rsvp = await rsvpModel.unrsvp(userId, eventId);

        res.status(200).send(rsvp || null);
    } catch (err) {
        next(err);
    }
};

// GET /api/users/:user_id/rsvps
const listUserRsvps = async (req, res, next) => {
    try {
        const userId = Number(req.params.user_id);
        const eventIds = await rsvpModel.listByUser(userId);
        const events = await Promise.all(
            eventIds.map(id => eventModel.find(id))
        );
        res.send(events);
    } catch (err) {
        next(err);
    }
};

module.exports = { createRsvp, deleteRsvp, listUserRsvps };
