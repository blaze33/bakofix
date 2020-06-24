var express = require('express');
var router = express.Router();
const fetch = require('isomorphic-fetch');
const {
  check,
  validationResult
} = require('express-validator');
const mailgun = require('mailgun.js')
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  public_key: process.env.MAILGUN_PUBLIC_KEY,
  url: 'https://api.eu.mailgun.net'
});

/* POST contact us form. */
router.post('/contact-us', [
  check('name').exists({checkFalsy: true}),
  check('email').normalizeEmail().isEmail(),
  check('message').exists({checkFalsy: true}),
  check('g-recaptcha-response').exists({checkFalsy: true})
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    });
  }

  const secret_key = process.env.RECAPTCHA_SECRET_KEY;
  const token = req.body['g-recaptcha-response'];
  const name = req.body['name'];
  const email = req.body['email'];
  const message = req.body['message'];
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;
  console.log({
    name, email, message
  })

  // console.log(req)
  fetch(url, {
    method: 'post'
  })
    .then(response => response.json())
    .then(google_response => {
      mg.messages.create('mg.openbloc.com', {
          from: `${name} <${email}>`,
          to: ["contact@openbloc.com"],
          subject: `New message from ${name}`,
          text: message
        }).then(msg => res.json({status: 'ok'}))
          .catch(err => {
            res.status(500).json({err})
          });
    })
    .catch(error => res.status(500).json({ error }));

});

module.exports = router;
