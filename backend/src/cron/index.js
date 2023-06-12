const cron = require('node-cron');
const processQueue = require('./processQueueController');

const cron1 = cron.schedule('* * * * *', processQueue, {
  scheduled: false,
  timezone: "America/Chicago"
});

if(process.env.NODE_ENV !== 'test') cron1.start()