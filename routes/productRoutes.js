const express = require('express');
const { initializeDatabase } = require('../controllers/productController');
const router = express.Router();
const {
    listTransactions,
    getStatistics,
    getBarChart,
    getPieChart,
    getCombinedData
} = require('../controllers/productController');
  
router.get('/initialize', initializeDatabase);
router.get('/transactions', listTransactions);
router.get('/statistics', getStatistics);
router.get('/bar-chart', getBarChart);
router.get('/pie-chart', getPieChart);
router.get('/combined', getCombinedData);

module.exports = router;
