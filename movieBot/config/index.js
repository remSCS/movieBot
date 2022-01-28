'use strict';

if(process.env.NODE_ENV === 'production'){
  module.exports = {
    FB: {
      pageAccessToken: process.env.pageAccessToken,
      VerifyToken: process.env.VerifyToken,
      appSecret: process.env.appSecret
    }
  }
}

else{
  console.log('Check environment variables');
  //module.exports = require('./development.json');
}