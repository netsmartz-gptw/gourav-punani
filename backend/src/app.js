const express = require('express')
const app = express()
const cors = require('cors');
const helmet = require("helmet");
const { handleError } = require("./helpers");
const moodleRoute = require('./route/galileoRoute')

const connectToMongo = require('./config/mongoConnection')
if(process.env.NODE_ENV !== 'test') connectToMongo().then(async () => console.log('connected to mongo'));

require('./mysql/relations')
require('./cron')

// middlewares
app.use(helmet());      // Secure HTTP headers
app.use(cors())
app.use(express.json()) 

const userRoute = process.env.NODE_ENV === 'production' ? '/' : '/galileo';
app.use(userRoute, moodleRoute); 

// Always use the end of other middlewares and routes for it to function correctly
app.use((err, req, res, next) => { 
    handleError(err, res);
});

module.exports = app