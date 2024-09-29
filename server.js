const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const PORT = 8080;
const productRoutes = require('./routes/productRoutes');

app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/mern_challenge')
  .then(() => console.log('DB Connected!'));


app.use('/api/products', productRoutes);

app.listen(PORT, ()=> {
    console.log("App is listening to port 8080");
})