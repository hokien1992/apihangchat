const express = require('express')
const createError = require('http-errors')
const path = require('path')
const multer = require('multer')
var upload = multer({
    dest: './public/user/'
});
const fs = require('fs')
const cookieParser = require('cookie-parser')
const morgan = require('morgan');


const logger = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true })
const bodyParser = require('body-parser')
var dateTime = require('node-datetime')
var dt = dateTime.create()
var dateFormat = require('dateformat');
// Start Captcha

// End Captcha
//Phân trang
const paginateHelper = require('express-handlebars-paginate')

// these are require packages that we need
// Handlebars
const Handlebars = require('handlebars')
// End Handlebars
const hbs = require('express-hbs')
hbs.registerHelper('if_arr_exist', function(a, b, opts) {
    if(a.length > b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
})
// Check điều kiện
hbs.registerHelper('if_eq', function(a, b, opts) {
    if(a == b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
})
hbs.registerHelper('if_eqnot', function(a, b, opts) {
    if(a != b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
})
hbs.registerHelper('ifeq', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});

hbs.registerHelper('ifnoteq', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
});
//Phân trang
hbs.registerHelper('paginate', require('handlebars-paginate'))
// format datetime
hbs.registerHelper('showformatDatime', function(timestamp) {
  var day=dateFormat(timestamp, "dd-mm-yyyy h:MM:ss");
  return day;
});
//Register Helper
hbs.handlebars.registerHelper('paginateHelper', paginateHelper.createPagination)
//Format number
const HandlebarsIntl = require('handlebars-intl')
HandlebarsIntl.registerWith(hbs)
const tools = require('./modules/tools')
    //hbs.registerPartials(__dirname + '/views/partials')
const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash')
const validator = require('express-validator')
const MongoStore = require('connect-mongo')(session)

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
// Admin
var backendDashboardRouter = require('./routes/admin/dashboard')
var backendAdminRouter = require('./routes/admin/admin')
var backendUserRouter = require('./routes/admin/users')
var backendProductRouter = require('./routes/admin/product')
var backendCatProductRouter = require('./routes/admin/catproduct')
var backendTagRouter = require('./routes/admin/tag')
var backendGalleryRouter = require('./routes/admin/gallery')
var backendAuthRouter = require('./routes/admin/auth')
    // Api
var apialiasRouter = require('./routes/api/alias')
var adminsRouter = require('./routes/api/admin')
var apiRoleRouter = require('./routes/api/role')
var apiMenuRouter = require('./routes/api/menu')
var apiPositionmenuRouter = require('./routes/api/positionmenu')
var apiPermissionRouter = require('./routes/api/permission')
var apiUserRouter = require('./routes/api/users')
var apiProductRouter = require('./routes/api/product')
var apiCatProductRouter = require('./routes/api/catproduct')
var apiStyleProductRouter = require('./routes/api/styleproduct')
var apiSupplierRouter = require('./routes/api/supplier')
var apiTagRouter = require('./routes/api/tag')
var apiSettingRouter = require('./routes/api/setting')
var apiGalleryRouter = require('./routes/api/gallery')
var apiStylegalleryRouter = require('./routes/api/stylegallery')
var apiPhotoRouter = require('./routes/api/photo')
var apiFoldermediaRouter = require('./routes/api/foldermedia')
var apiOrderRouter = require('./routes/api/order')
var apiLadingRouter = require('./routes/api/lading')
var apiLocationRouter = require('./routes/api/location')
// Thuộc tính sản phẩm
var apiOptionRouter = require('./routes/api/option')
var apiOptionProductRouter = require('./routes/api/option_product')
// Trang tin tức
var apiCatnewRouter = require('./routes/api/catnew')
var apiNewRouter = require('./routes/api/new')
// Trang tĩnh
var apiPageRouter = require('./routes/api/page')
var momoRouter = require('./routes/api/momo')
// Báo cáo
// Trang tĩnh
var apiReportRouter = require('./routes/api/report')
// Giao dịch
var apiExchangeRouter = require('./routes/api/exchange')
var apiAuthRouter = require('./routes/auth')

// Frontend
var captchaRouter = require('./routes/frontend/captcha')

var app = express();
uri = 'mongodb://hangchat_db:2wDpcMwwXDUyE1@127.0.0.1:27017/hangchat_hangchat'
// Connecting local mongodb database named test
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useCreateIndex', true)
const conn = mongoose.connection

require('./config/passport')

app.engine('hbs', hbs.express4({
    defaultLayout: __dirname + '/views/layouts/layout',
    layoutsDir: __dirname + '/views/partials',
    partialsDir: __dirname + '/views'
}));

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// right here we need to allow domain
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3012', 'http://localhost:8000', 'https://admin.vietnamepay.com', 'https://vietnamepay.com', 'https://vietnamepay.com/hanhtrinhvandon',  'http://localhost:3008','https://admin.beta.vietnamepay.com'],
  credentials: true,
}
app.use(cors(corsOptions))
//app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(morgan('dev'));
app.use(validator());
app.use(cookieParser());
app.use(session({
    secret: 'mysupersecret',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
//
app.use(express.static(path.join(__dirname,'public')))
app.use(tools.onRequestStart)
app.use(function(req, res, next) {
    if (req.user) {
        res.locals.tracking = req.user
    } else {
        res.locals.tracking = ''
    }
    res.locals.login = req.isAuthenticated()
    res.locals.session = req.session

    next()
})
//app.use('/users', usersRouter)
// app.use('*', function(req, res) {
//     res.redirect('https://' + req.headers.host + req.url);
// })
app.use('/backend', backendDashboardRouter)
app.use('/backend/admin/', backendAdminRouter)
app.use('/backend/user', backendUserRouter)
app.use('/backend/product', backendProductRouter)
app.use('/backend/catproduct', backendCatProductRouter)
app.use('/backend/tag', backendTagRouter)
app.use('/backend/gallery', backendGalleryRouter)
app.use('/backend/auth', backendAuthRouter)
    //apialiasRouter
app.use('/api/alias', apialiasRouter)
app.use('/api/admin', adminsRouter)
app.use('/api/role', apiRoleRouter)
app.use('/api/menu', apiMenuRouter)
app.use('/api/positionmenu', apiPositionmenuRouter)
app.use('/api/permission', apiPermissionRouter)
app.use('/api/user', apiUserRouter)
app.use('/api/product', apiProductRouter)
app.use('/api/catproduct', apiCatProductRouter)
app.use('/api/styleproduct', apiStyleProductRouter)
app.use('/api/supplier', apiSupplierRouter)
app.use('/api/tag', apiTagRouter)
app.use('/api/setting', apiSettingRouter)
app.use('/api/gallery', apiGalleryRouter)
app.use('/api/stylegallery', apiStylegalleryRouter)
app.use('/api/photo', apiPhotoRouter)
app.use('/api/foldermedia', apiFoldermediaRouter)
app.use('/api/order', apiOrderRouter)
//api vận đơn
app.use('/api/lading', apiLadingRouter)
app.use('/api/location', apiLocationRouter)
app.use('/api/catnew', apiCatnewRouter)
app.use('/api/new', apiNewRouter)
app.use('/api/option', apiOptionRouter)
app.use('/api/option_product', apiOptionProductRouter)
    // Trang tĩnh
app.use('/api/page', apiPageRouter)
    // Báo cáo
app.use('/api/report', apiReportRouter)
    // Giao dịch
app.use('/api/exchange', apiExchangeRouter)

app.use('/api/auth', apiAuthRouter)
    // Router frontend
app.use('/users', usersRouter)
    // captchaRouter
app.use('/captcha', captchaRouter)
//momoRouter
app.use('/api/momo', momoRouter)
app.post('/testUpload', function(req, res){
  var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/user/');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
  });
  var upload = multer({ storage : storage}).single('file');
  upload(req,res,function(err) {
    if(err) {
        return res.end("Error uploading file.");
    }
    res.end("File is uploaded successfully!");
  });
})
app.use('/', indexRouter)
const axios = require('axios')
var CronJob = require('cron').CronJob;
var job = new CronJob('00 00 00 * * 0-6', async function(req, res) {
  var data = await axios.get('https://beta.vietnamepay.com/check_update_wallet').then(response => {
        return response.data
      }).catch(error => {
        return error
      })
},
true
);
job.start();
  // catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'product' ? err : {}
  // render the error page
  res.status(err.status || 500)
  res.render('error')
});
module.exports = app
