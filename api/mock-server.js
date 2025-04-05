// This is a mock server for demonstration purposes
// In a real application, you would replace this with actual API endpoints

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: ['http://localhost', 'http://127.0.0.1'], // Add your client URLs here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

let tasks = [];

// [Keep all your existing endpoints here...]

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mock server running on http://localhost:${PORT}`);
});

// let tasks = [];

// Get all tasks
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// Create a new task
app.post('/api/tasks', (req, res) => {
    const task = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    tasks.push(task);
    res.status(201).json(task);
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    res.json(tasks[taskIndex]);
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    tasks = tasks.filter(t => t.id !== taskId);
    res.status(204).send();
});

// Sync tasks (replace all)
app.post('/api/tasks/sync', (req, res) => {
    tasks = req.body;
    res.json(tasks);
});

// const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Mock server running on http://localhost:${PORT}`);
});