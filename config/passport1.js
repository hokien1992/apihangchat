var passport = require('passport');
var User = require('../models/user');
var Admin = require('../models/admin');
var LocalStrategy = require('passport-local').Strategy;
passport.serializeUser(function(admin, done){
    done(null, admin.id);
});
passport.deserializeUser(function(id, done){
    Admin.findById(id, function(err, admin){
        if(admin){
            done(err, admin);
        }
    });
});
passport.use('local.sigin', new LocalStrategy({
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
    Admin.findOne({ 'email': email },function(err, admin){
        if(err){
            return done(err);
        }
        if(!admin){
            return done(null, false, { message: 'Không tìm thấy email!' })
        }
        if(!admin.validPassword(password)){
            return done(null, false, { message: 'Mật khẩu không đúng!' })
        }
        return done(null, admin)
    });
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'Không phải định dạng Email!').notEmpty().isEmail()
    req.checkBody('password', 'Mật khẩu không nhỏ hơn 6 ký tự').notEmpty().isLength({min:6})
    //var errors = validationErrors();
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg)
        });
        return done(null, false, req.flash('error', messages))
    }
    User.findOne({'email': email}, function(err, user){
        if(err){
            return done(err)
        }
        if(user){
            return done(null, false, {message: 'Email đã được sử dụng!'})
        }
        var newUser = new User()
        newUser.email = email
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err, result){
            if(err){
                return done(null, newUser)
            }
            return done(null, newUser)
        });
    })
}));
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'Không phải định dạng Email!').notEmpty().isEmail(),
    req.checkBody('password', 'Mật khẩu không đúng').notEmpty()
    var errors = req.validationErrors()
    if(errors){
        var messages = []
        errors.forEach(function(error){
            messages.push(error.msg)
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({ 'email': email },function(err, user){
        if(err){
            return done(err)
        }
        if(!user){
            return done(null, false, { message: 'Không tìm thấy email!' })
        }
        if(!user.validPassword(password)){
            return done(null, false, { message: 'Mật khẩu không đúng!' })
        }
        return done(null, user)
    })
}))
//========================admin
