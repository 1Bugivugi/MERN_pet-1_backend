import express from 'express';
import cors from 'cors';
import restaurants from './api/restaurants.route.js'

const app = express();

// Middleware
app.use(cors())
app.use(express.json()) // Our server can accept json in the body of a request

// Routes
app.use('/api/v1/restaurants', restaurants)
app.use('*', (req, res) => {
    res.status(400).json({ error: "not found" })
})

export default app;