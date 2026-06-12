const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/index'));

// Health check
app.get('/', (req, res) => res.json({ 
  message: 'ShikshaSoft API running', 
  version: '1.0.0',
  time: new Date().toISOString() 
}));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ShikshaSoft server running on port ${PORT}`));
