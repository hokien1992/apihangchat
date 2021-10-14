const cron = require('cron');
const updateEpay = require('./updateEpay'); // require module xuất báo cáo

const job = new cron.CronJob({
  cronTime: '00 30 23 * * 0-6', // Chạy Jobs vào 23h30 hằng đêm
  onTick: function() {
  },
  start: true,
  timeZone: 'Asia/Ho_Chi_Minh' // Lưu ý set lại time zone cho đúng
});

job.start();
