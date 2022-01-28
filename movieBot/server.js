'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const config = require('./config')
const fbeamer = require('./fbeamer')
const matcher = require('./matcher');

const server = express();
const PORT = process.env.PORT || 3000;

let stream = new fbeamer(config.FB);

server.post('/fbbot', bodyParser.json({
  verify: stream.verifySignature.call(stream)
}));

server.post('/fbbot', (req, res, next) => {
  return stream.incoming(req, res, async data => {
    try {
      matcher(data.content, cb => {
        switch (cb.intent) {
          case 'Hello':
            stream.txt(data.sender, `${cb.entities.groups.greeting} you!`);
            console.log(`${cb.entities.groups.greeting} you!`);
            break;

          case 'Exit':
            stream.txt(data.sender, 'bye');
            console.log('bye');
            break;

          case 'get weather':
            stream.txt(data.sender, 'metéo');
            console.log('metéo');
            break;

          case 'Current Weather':
            stream.txt(data.sender, 'météo actuelle');
            console.log('météo actuelle');
            break;

          default:
            switch (data.content) {
              case 'send me image':
                stream.img(data.sender, 'https://img.buzzfeed.com/buzzfeed-static/static/2017-02/3/16/campaign_images/buzzfeed-prod-fastlane-03/a-french-consulate-in-brazil-actually-used-a-pepe-2-8670-1486156846-0_dblbig.jpg');
                console.log('pepe image link');
                break;

              default:
                stream.txt(data.sender, 'Huh ???');
                console.log('Huh ???');
                break;

            }        }
      })

    } catch (e) {
      console.log('error' + e);
    }
  });
});

server.get('/', (req, res) => res.send(`<h1>Hello world!</h1></br>Verify token is: ${stream.VerifyToken}</br>Access token is: ${stream.pageAccessToken}`));

server.get('/fbbot', (req, res) => stream.registerHook(req, res));

server.listen(PORT, () => console.log(`The bot server is running on port ${PORT}`));