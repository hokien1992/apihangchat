
var checkLogin = {}
checkLogin.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated('local.authLogin')){
        return next();
    }
    res.redirect('/auth/login')
}
checkLogin.notLoggedIn = function(req, res, next){
    if(!req.isAuthenticated('local.authLogin')){
        return next();
    }
    res.redirect('/backend')
}
module.exports = checkLogin