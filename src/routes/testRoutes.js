const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Test route to check MongoDB connection
router.get('/db-status', (req, res) => {
  const connectionState = mongoose.connection.readyState;
  const stateMessages = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
    99: 'Uninitialized'
  };

  res.json({
    status: connectionState === 1 ? 'success' : 'error',
    connection: stateMessages[connectionState] || 'Unknown',
    connectionState,
    database: mongoose.connection.db ? mongoose.connection.db.databaseName : 'None',
    host: mongoose.connection.host || 'None',
    port: mongoose.connection.port || 'None',
    models: Object.keys(mongoose.models)
  });
});

module.exports = router;
