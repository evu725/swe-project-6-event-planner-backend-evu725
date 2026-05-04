const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
require('dotenv').config();

const logRoutes = require('./middleware/logRoutes');
const checkAuthentication = require('./middleware/checkAuthentication');

const authControllers = require('./controllers/authControllers');
const userControllers = require('./controllers/userControllers');
const eventControllers = require('./controllers/eventControllers');
const rsvpControllers = require('./controllers/rsvpControllers');

const app = express();
const PORT = process.env.PORT || 8080;

const pathToFrontend = process.env.NODE_ENV === 'production' ? '../frontend/dist' : '../frontend';

/* ====================================
   Middleware
==================================== */
app.use(logRoutes);

app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  maxAge: 24 * 60 * 60 * 1000,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, pathToFrontend)));

/* ====================================
   Auth routes (public)
==================================== */
app.post('/api/auth/register', authControllers.register);
app.post('/api/auth/login', authControllers.login);
app.get('/api/auth/me', authControllers.getMe);
app.delete('/api/auth/logout', authControllers.logout);

/* ====================================
   USER ROUTES
==================================== */
app.get('/api/users', userControllers.listUsers);
app.patch('/api/users/:user_id', checkAuthentication, userControllers.updateUser);
app.delete('/api/users/:user_id', checkAuthentication, userControllers.deleteUser);

/* ====================================
   EVENT ROUTES
==================================== */
app.get('/api/events', eventControllers.listEvents);
app.get('/api/users/:user_id/events', eventControllers.listUserEvents);
app.post('/api/events', checkAuthentication, eventControllers.createEvent);
app.patch('/api/events/:event_id', checkAuthentication, eventControllers.updateEvent);
app.delete('/api/events/:event_id', checkAuthentication, eventControllers.deleteEvent);

/* ====================================
   RSVP ROUTES
==================================== */
app.post('/api/events/:event_id/rsvps', checkAuthentication, rsvpControllers.createRsvp);
app.delete('/api/events/:event_id/rsvps', checkAuthentication, rsvpControllers.deleteRsvp);
app.get('/api/users/:user_id/rsvps', rsvpControllers.listUserRsvps);

/* ====================================
   Global Error Handling
==================================== */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

/* ====================================
   Listen
==================================== */
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);