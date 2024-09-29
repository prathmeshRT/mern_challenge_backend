const axios = require('axios');
const Product = require('../models/Product');

exports.initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const products = response.data;
    await Product.insertMany(products);
    res.status(200).send('Database initialized with seed data');
  } catch (error) {
    res.status(500).send('Error initializing database');
  }
};


//For listing transaction
exports.listTransactions = async (req, res) => {
    const { month, search = '', page = 1, perPage = 10 } = req.query;
    const regex = new RegExp(search, 'i');
    const startOfMonth = new Date(`2023-${month}-01`);
    const endOfMonth = new Date(`2023-${month}-01`);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  
    try {
      const transactions = await Product.find({
        dateOfSale: { $gte: startOfMonth, $lt: endOfMonth },
        $or: [
          { title: regex },
          { description: regex },
          { price: regex },
        ],
      })
      .skip((page - 1) * perPage)
      .limit(perPage);
      
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).send('Error fetching transactions');
    }
  };
  

// for statistics
exports.getStatistics = async (req, res) => {
    const { month } = req.query;
    const startOfMonth = new Date(`2023-${month}-01`);
    const endOfMonth = new Date(`2023-${month}-01`);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  
    try {
      const totalSales = await Product.aggregate([
        { $match: { dateOfSale: { $gte: startOfMonth, $lt: endOfMonth } } },
        { $group: { _id: null, totalAmount: { $sum: '$price' }, soldItems: { $sum: { $cond: [ '$sold', 1, 0 ] } }, notSoldItems: { $sum: { $cond: [ '$sold', 0, 1 ] } } } },
      ]);
  
      res.status(200).json(totalSales[0]);
    } catch (error) {
      res.status(500).send('Error fetching statistics');
    }
};
  

// for bar chart
exports.getBarChart = async (req, res) => {
    const { month } = req.query;
    const startOfMonth = new Date(`2023-${month}-01`);
    const endOfMonth = new Date(`2023-${month}-01`);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  
    try {
      const priceRanges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901-above', min: 901, max: Infinity },
      ];
  
      const barChart = await Promise.all(
        priceRanges.map(async range => {
          const count = await Product.countDocuments({
            dateOfSale: { $gte: startOfMonth, $lt: endOfMonth },
            price: { $gte: range.min, $lt: range.max }
          });
          return { range: range.range, count };
        })
      );
  
      res.status(200).json(barChart);
    } catch (error) {
      res.status(500).send('Error fetching bar chart data');
    }
};

// Pie chart
exports.getPieChart = async (req, res) => {
    const { month } = req.query;
    const startOfMonth = new Date(`2023-${month}-01`);
    const endOfMonth = new Date(`2023-${month}-01`);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  
    try {
      const pieChart = await Product.aggregate([
        { $match: { dateOfSale: { $gte: startOfMonth, $lt: endOfMonth } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);
  
      res.status(200).json(pieChart);
    } catch (error) {
      res.status(500).send('Error fetching pie chart data');
    }
};
  

// combining all
exports.getCombinedData = async (req, res) => {
    const { month } = req.query;
  
    try {
      const transactions = await Product.find({
        dateOfSale: {
          $gte: new Date(`2023-${month}-01`),
          $lt: new Date(`2023-${month}-31`)
        }
      });
  
      const totalSales = await Product.aggregate([
        { $match: { dateOfSale: { $gte: new Date(`2023-${month}-01`), $lt: new Date(`2023-${month}-31`) } } },
        { $group: { _id: null, totalAmount: { $sum: '$price' }, soldItems: { $sum: { $cond: [ '$sold', 1, 0 ] } }, notSoldItems: { $sum: { $cond: [ '$sold', 0, 1 ] } } } },
      ]);
  
      const priceRanges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901-above', min: 901, max: Infinity },
      ];
  
      const barChart = await Promise.all(
        priceRanges.map(async range => {
          const count = await Product.countDocuments({
            dateOfSale: { $gte: new Date(`2023-${month}-01`), $lt: new Date(`2023-${month}-31`) },
            price: { $gte: range.min, $lt: range.max }
          });
          return { range: range.range, count };
        })
      );
  
      const pieChart = await Product.aggregate([
        { $match: { dateOfSale: { $gte: new Date(`2023-${month}-01`), $lt: new Date(`2023-${month}-31`) } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);
  
      res.status(200).json({
        transactions,
        totalSales: totalSales[0],
        barChart,
        pieChart
      });
    } catch (error) {
      res.status(500).send('Error fetching combined data');
    }
};
  