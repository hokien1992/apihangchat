var express = require('express')
const url = require('url')
//required Trang sản phẩm
const productController = require('./ProductController')
var siteController = {}
//router.use(csrfProtection);
siteController.index = function(req, res, next){
    var query = url.parse(req.url,true)

    // if(query.path!="/abc/test"){
    //     res.send({site:'Trang site'})
    // }
    //return productController.index('alias','id')
    //res.send(query)
    //res.send({data:productControllers('abcd','123456')})
    //return productController.index
    //res.send(req)
    //res.send({test:query})
    // if(req.data.paths=='/abc/test'){
    //     res.send({paths:req.path})
    // }else{
    //     res.send({paths1:req.path})
    // }
}
module.exports = siteController;
