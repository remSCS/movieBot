class FBeamer {
  constructor({ pageAccessToken, VerifyToken, appSecret }) {
    try {
      if (typeof pageAccessToken != 'undefined' && typeof VerifyToken != 'undefined' && typeof appSecret != 'undefined') {
        this.pageAccessToken = pageAccessToken;
        this.VerifyToken = VerifyToken;
        this.appSecret = appSecret;
      }

      else {
        var err = "error";
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  registerHook(req, res) {
    const params = req.query;
    const mode = params['hub.mode'], token = params['hub.verify_token'], challenge = params['hub.challenge'];

    try {
      if (mode === 'subscribe' && token === this.VerifyToken) {
        console.log('token ok');
        res.status(200).send(challenge);
      }
      else {
        console.log('Couldn\'t register WebHook');
        return res.sendStatus(200);
      }
    }
    catch (e) {
      console.log(e);
    }
  }

  verifySignature(req, res, buf) {
    return (req, res, buf) => {
      if (req.method === 'POST') {
        try {
          const params = req.query;
          console.log(req.headers['x-hub-signature']);
          let tempo_hash = require('crypto').createHmac('sha1', this.appSecret).update(buf, 'utf-8');
          let hash = tempo_hash.digest('hex');
          console.log(hash);

          if (req.headers['x-hub-signature'] === ("sha1=" + hash)) {
            console.log("Matching signatures!")
          }
          else {
            console.log("Signature incorrect!")
          }

        }
        catch (e) {
          console.log(e);
        }
      }
    }
  }

  incoming(req, res, cb) {
    res.sendStatus(200);
    if (req.body.object === 'page' && req.body.entry) {
      let data = req.body;
      data.entry.forEach(pageObj => {
        if (pageObj.messaging) {
          pageObj.messaging.forEach(messageObj => {
            if (messageObj.postback) {
              // Handle postbacks
            }
            else {
              return cb(this.messageHandler(messageObj));
            }
          })
        }
      })
    }
  }

  messageHandler(obj) {
    let sender = obj.sender.id;
    let message = obj.message;
    console.log(obj.message);
    if (message.text) {
      let obj = {
        sender,
        type: 'text',
        content: message.text
      }

      return obj;
    }
  }

  sendMessage(payload) {
    const request = require('request');
    const apiVersion = 'v12.0';
    return new Promise((resolve, reject) => {
      request({
        url: `https://graph.facebook.com/${apiVersion}/me/messages`,
        qs: {
          access_token: this.pageAccessToken
        },
        method: 'POST',
        json: payload
      }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          resolve({
            mid: body.message_id
          });
        } else {
          reject(error);
        }
      });
    });
  }

  txt(id, text, messaging_type = 'RESPONSE') {
    let obj = {
      messaging_type,
      recipient: {
        id
      },
      message: {
        text
      }
    }

    return this.sendMessage(obj);
  }

img(id, url, messaging_type = 'RESPONSE') {
    let obj = {
      messaging_type,
      recipient: {
        id
      },
      message: {
        attachment:{
          "type": "image",
          "payload":{
            "url":url,
            "is_reusable": true
          }
        }
      }
    }

    return this.sendMessage(obj);
  }}

module.exports = FBeamer