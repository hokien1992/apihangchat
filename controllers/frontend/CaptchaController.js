var express = require('express')
var bcrypt = require('bcryptjs')
// Captcha
var svgCaptcha = require('svg-captcha');
// End Captcha
var User = require("../../models/user")
var Setting = require('../../models/setting')
var Menu = require('../../models/menu')
var Product = require('../../models/product')
var Users = require('../../models/user')
var Order = require('../../models/order')
var Location = require('../../models/location')
var Exchange = require('../../models/exchange')
var dateTime = require('node-datetime')
var dt = dateTime.create()
// Captcha
var svgCaptcha = require('svg-captcha');
// End Captcha
var url = require('url')
var captchaController = {}
var router = express.Router()
captchaController.viewcaptcha = function(req, res){
  var options = {
    background: '#f6f6f6',
    size: 3,
    fontSize: 35,
    color: false,
    noise: 0,
    width: 200,
    height: 35,
    charPreset: '0123456789'
  }
  var captcha = svgCaptcha.create(options)
  req.session.captcha = captcha.text
  //res.type('html')
  res.status(200).send(captcha.data)
}
module.exports = captchaController
