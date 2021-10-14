var passport = require('passport')
var Admin = require('../models/user')
const Users = require("../models/user")
const Wallet_v1 = require("../models/wallet_v1")
const Wallet_v2 = require("../models/wallet_v2")
const Wallet_v3 = require("../models/wallet_v3")
var Setting = require("../models/setting")
const axios = require('axios')
var nodemailer =  require('nodemailer')
var randomstring = require("randomstring")
var dateTime = require('node-datetime')
var dt = dateTime.create()
var moment = require('moment')
const url = require('url')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy  = require('passport-facebook').Strategy;
const config = require('./config-facebook');

passport.serializeUser(function(user, done){
    done(null, user.id);
});
passport.deserializeUser(function(id, done){
    Admin.findById(id, function(err, user){
        done(err, user);
    })
});
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async function(req, email, password, done){
    req.checkBody('email', 'Không phải định dạng Email!').notEmpty().isEmail()
    req.checkBody('username', 'Không được bỏ trống ID đăng nhập').notEmpty()
    req.checkBody('password', 'Mật khẩu không nhỏ hơn 6 ký tự').notEmpty().isLength({min:6})
    req.checkBody('repassword','Mật khẩu phải trùng nhau').equals(req.body.password)
    //var errors = validationErrors();
    var errors = req.validationErrors()
    if(errors){
      var messages = [];
      errors.forEach(function(error){
          messages.push(error.msg);
      })
      return done(null, false, req.flash('error', messages));
    }
    var data_wallet_v1 = {
      w_commission: 0,
      w_consumption: 0,
      w_akie: 0,
      w_epay: 0,
    }
    var data_wallet_v2 = {
      w_commission: 0,
      w_consumption: 0,
      w_akie: 0,
      w_epay: 0,
    }
    var data_wallet_v3 = {
      w_commission: 0,
      w_consumption: 0,
      w_akie: 0,
      w_epay: 0,
    }
    var post_wallet_v1 = new Wallet_v1(data_wallet_v1)
    post_wallet_v1.save(function(err, result){
      return result
    })
    var post_wallet_v2 = new Wallet_v2(data_wallet_v2)
    post_wallet_v2.save(function(err, result){
      return result
    })
    var post_wallet_v3 = new Wallet_v3(data_wallet_v3)
    console.log(post_wallet_v3)
    post_wallet_v3.save(function(err, result){
      console.log()
      return result
    })
    var name = req.body.firstname+' '+req.body.lastname
    var username = req.body.username
    var idepay = req.body.idepay
    var introduce = req.body.introduce
    var firstname = req.body.firstname
    var lastname = req.body.lastname
    var phone = req.body.phone
    var country = req.body.country
    var province = req.body.province
    var district = req.body.district
    var address = req.body.address
    var description = req.body.note
    var parent_id = ''
    var wallet_id = post_wallet_v1._id
    var wallet_id2 = post_wallet_v2._id
    var wallet_id3 = post_wallet_v3._id
    if(req.cookies.affRes!==undefined||req.body.introduce!=""){
      var dataParent = await Users.findOne({tracking: req.cookies.affRes})
      var dataParent_introduce = await Users.findOne({username: req.body.introduce})
      if(dataParent_introduce){
          parent_id = dataParent_introduce._id
          var arr_parent = dataParent_introduce.arr_parent
          if(dataParent_introduce.arr_parent.length<15){
            arr_parent[dataParent_introduce.arr_parent.length] = dataParent_introduce._id
          }else{
            dataParent_introduce.arr_parent.shift()
            arr_parent[arr_parent.length] = dataParent_introduce._id
          }
          if(dataParent_introduce.username=='vietnamepay'){
            introduce = 'vietnamepay'
          }
      }else{
        var arr_parent = []
        if(dataParent){
          parent_id = dataParent._id
        }
        introduce = 'vietnamepay'
      }
    }
    var itemUser = await Admin.findOne({email: email.toLowerCase()})
    var itemUser1 = await Admin.findOne({username: username})
    if(itemUser){
      return done(null, false, {message: 'Email đã tồn tại!'});
    }else{
      if(itemUser1){
        return done(null, false, {message: 'Tài khoản đăng nhập đã tồn tại!'});
      }else{
        var newAdmin = new Admin()
        newAdmin.email = email.toLowerCase()
        newAdmin.password = newAdmin.encryptPassword(password)
        newAdmin.username = username
        newAdmin.name = name
        newAdmin.idepay = idepay
        newAdmin.introduce = introduce
        newAdmin.firstname = firstname
        newAdmin.lastname = lastname
        newAdmin.phone = phone
        newAdmin.country = country
        newAdmin.province = province
        newAdmin.district = district
        newAdmin.address = address
        newAdmin.description = description
        newAdmin.parent_id = parent_id
        newAdmin.level = 0
        newAdmin.wallet_id = wallet_id
        newAdmin.wallet_id2 = wallet_id2
        newAdmin.wallet_id3 = wallet_id3
        newAdmin.token_confirm = randomstring.generate()
        newAdmin.arr_parent = arr_parent
        newAdmin.save( async function(err, result){
          if(err){
            return done(null, err)
          }
          if(result){
            let settings = await Setting.findOne({ lang: "index" }).populate('logo').populate('favicon')

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 587,
              //secure: false, // true for 465, false for other ports
              auth: {
                  //user: "hokien1992@gmail.com", // generated ethereal user
                  //pass: "drloytkqpliwwzwd" // generated ethereal password
                  user: "vietnamepay@gmail.com",
                  pass: "xynptothaylhwevt"
              },
              tls: {
                rejectUnauthorized: false
              }
            })
            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: settings.company, // sender address
                to: result.email, // list of receivers
                subject: settings.name, // Subject line
                text: result.name+' bạn kích vào link bên dưới để kích hoạt tài khoản nhé', // plain text body
                html: '<a href="https://vietnamepay.com/confirm/'+result.token_confirm+'" target="_blank">Bạn click vào đây để được kích hoạt tài khoản qua hệ thống epay của chúng tôi</a>' // html body
            })
          }
          return done(null, false, {message: "1"});
        })
      }
    }
}))
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'Không phải định dạng Email!').notEmpty().isEmail(),
    req.checkBody('password', 'Mật khẩu không đúng').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    Admin.findOne({ 'email': email.toLowerCase() }, async function(err, admin){
        if(err){
            return done(err);
        }
        if(!admin){
            return done(null, false, { message: 'Không tìm thấy email!' });
        }
        if(!admin.validPassword(password)){
            return done(null, false, { message: 'Mật khẩu không đúng!' });
        }
        if(admin.active==0){
            return done(null, false, { message: 'Tài khoản chưa kích hoạt hoặc vào email để kích hoạt tài khoản!' });
        }
        var datav = {
        "USERNAME": "ceo@weon.vn",
        "PASSWORD": "Anhdoan123"
        }
        var config = {
          method: 'post',
          url: 'https://partner.viettelpost.vn/v2/user/Login',
          data: datav,
          headers: {
            'Content-Type': 'application/json',
           }
        }
        let instance = await axios(config)
        var sessData = req.session
        sessData.tokenLoginViettel = instance.data.data.token
        return done(null, admin);
    });
}));


// Sử dụng FacebookStrategy cùng Passport.
passport.use(new FacebookStrategy({
    clientID: config.facebook_key,
    clientSecret:config.facebook_secret,
    callbackURL: config.callback_url,
    profileFields: config.profileFields
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(async function () {
      const itemUser = await Users.findOne({email: profile._json.email})
      if(itemUser){
        return done(null, itemUser);
      }else{
        const vnUser = await Users.findOne({username: 'vietnamepay'})
        var data_wallet_v1 = {
          w_commission: 0,
          w_consumption: 0,
          w_akie: 0,
          w_epay: 0,
        }
        var data_wallet_v2 = {
          w_commission: 0,
          w_consumption: 0,
          w_akie: 0,
          w_epay: 0,
        }
        var data_wallet_v3 = {
          w_commission: 0,
          w_consumption: 0,
          w_akie: 0,
          w_epay: 0,
        }
        var post_wallet_v1 = new Wallet_v1(data_wallet_v1)
        post_wallet_v1.save(function(err, result){
          return result
        })
        var post_wallet_v2 = new Wallet_v2(data_wallet_v2)
        post_wallet_v2.save(function(err, result){
          return result
        })
        var post_wallet_v3 = new Wallet_v3(data_wallet_v3)
        console.log(post_wallet_v3)
        post_wallet_v3.save(function(err, result){
          return result
        })
        // ==============
        var newAdmin = new Users()
        newAdmin.email = profile._json.email.toLowerCase()
        newAdmin.password = newAdmin.encryptPassword(profile._json.id)
        newAdmin.username = newAdmin.email
        newAdmin.name = profile._json.first_name +" "+profile._json.last_name
        newAdmin.introduce = vnUser.username
        newAdmin.firstname = profile._json.first_name
        newAdmin.lastname = profile._json.last_name

        newAdmin.parent_id = vnUser._id
        newAdmin.level = 0
        newAdmin.wallet_id = post_wallet_v1._id
        newAdmin.wallet_id2 = post_wallet_v2._id
        newAdmin.wallet_id3 = post_wallet_v3._id
        newAdmin.token_confirm = randomstring.generate()
        newAdmin.arr_parent = [vnUser._id]
        newAdmin.id_facebook = profile._json.id
        newAdmin.save( async function(err, result){
          if(err){
            return done(null, err)
          }
          return done(null, result);

        });
      }
      //console.log(profile._json)
      //console.log(accessToken, refreshToken, profile, done);
      //return done(null, profile);
      //return done(null, admin);
    });
  }
));
