var express = require('express');
var router = express.Router();
const fetch = require('isomorphic-fetch');
const {
  check,
  validationResult
} = require('express-validator');
const mailjet = require('node-mailjet').connect('api key', 'api secret');


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
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;

  // console.log(req)
  fetch(url, {
    method: 'post'
  })
    .then(response => response.json())
    .then(google_response => res.json({
      google_response
    }))
    .catch(error => res.json({ error }));

});

module.exports = router;
