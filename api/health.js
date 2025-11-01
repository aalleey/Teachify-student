const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Teachify Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;

