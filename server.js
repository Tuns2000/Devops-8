const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
  res.send('Todo API работает. Используйте /todos');
});

// строка подключения к MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/todosdb';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Todo = mongoose.model('Todo', todoSchema);

// GET /todos: Получить все задачи
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /todos: Создать новое задание
app.post('/todos', async (req, res) => {
  try {
    const { title, completed } = req.body;
    const todo = await Todo.create({ title, completed });
    res.status(201).json(todo);
  } catch (e) {
    res.status(400).json({ error: 'Bad request' });
  }
});

// GET /todos/:id: Получить одно задание по id
app.get('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Not found' });
    res.json(todo);
  } catch (e) {
    res.status(400).json({ error: 'Invalid id' });
  }
});

// PUT /todos/:id: Обновить одно задание по id
app.put('/todos/:id', async (req, res) => {
  try {
    const { title, completed } = req.body;
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { title, completed },
      { new: true, runValidators: true }
    );
    if (!todo) return res.status(404).json({ error: 'Not found' });
    res.json(todo);
  } catch (e) {
    res.status(400).json({ error: 'Invalid id or data' });
  }
});

// DELETE /todos/:id: Удалить одно задание по id
app.delete('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ error: 'Invalid id' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Todo app listening on port ${PORT}`);
});
