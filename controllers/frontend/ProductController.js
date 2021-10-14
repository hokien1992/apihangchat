var express = require('express')
var bcrypt = require('bcryptjs')
//
var Handlebars     = require('handlebars')
var HandlebarsIntl = require('handlebars-intl')
//Chèn models
const Product = require('../../models/product')
const Catproduct = require('../../models/catproduct')
const Styleproduct = require('../../models/styleproduct')
const Supplier = require('../../models/supplier')
const Setting = require('../../models/setting')
const Menu = require('../../models/menu')
const Photo = require('../../models/photo')
const Alias = require("../../models/alias")
const Gallery = require("../../models/gallery")
const Location = require("../../models/location")
var productController = {}
var router = express.Router()
const url = require('url')
productController.detail = async function(req,res,next) {
    var query = await url.parse(req.url,true)
    if(query.query.tracking){
      var sessData = req.session;
      sessData.tracking = query.query.tracking
    }
    var data_alias = await Alias.findOne({path:query.pathname.slice(1)})
    if(data_alias){
        if(data_alias.name_table=="product"){
            let itemproduct = await Product.findOne({_id: data_alias.id_table})
            //res.send({data: itemproduct.option_product})
            var gallerys = await Gallery.find({_id: {$in: itemproduct.imageArray}})
            // Loại sản phẩm
            let styleProduct = await Styleproduct.findOne({})
            // Tạo breakcrum danh mục
            let datacat = await Catproduct.find({})
            let itemcatproduct = await Catproduct.findOne({_id: itemproduct.category_id})


            let htmlBreakcrum = await breakcrumtab(itemcatproduct)
            // List danh mục sản phẩm
            let catproducts_sidebar = await Catproduct.find({ parent_id: null })
            //Hiển thị danh mục phân cấp
            if (catproducts_sidebar.length > 0) {
                for (i = 0; i < catproducts_sidebar.length; i++) {
                    catproducts_sidebar[i].parent = await Catproduct.find({ parent_id: catproducts_sidebar[i]._id })
                    //Lấy danh sách con của danh mục
                    for (j = 0; j < catproducts_sidebar[i].parent.length; j++) {
                        catproducts_sidebar[i].parent[j].parent = await Catproduct.find({ parent_id: catproducts_sidebar[i].parent[j]._id })
                    }
                    //Tách 1 mảng thành nhiều mảng
                    var productChunksCat = await []
                    var chunkSizeCat = await 3
                    for (var n = 0; n < catproducts_sidebar[i].parent.length; n += chunkSizeCat) {
                        await productChunksCat.push(catproducts_sidebar[i].parent.slice(n, n + chunkSizeCat))
                    }
                    catproducts_sidebar[i].parent = productChunksCat
                }
            }
            // Cấu hình hệ thống
            let settings = await Setting.findOne({lang: "index"}).populate('logo')
            // Hiển thị menu top
            var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
            if(datamenu.length>0){
                for(i=0; i<datamenu.length; i++){
                    datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
                    if(datamenu[i].children.length>0){
                        for(j=0; j<datamenu[i].children.length; j++){
                        datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
                        }
                    }
                }
            }
            // Hiển thị menu chân trang
            var datamenuBottom = await Menu.find({keyname:"menu_bottom",parent_id: null})
            if(datamenuBottom.length>0){
                for(i=0; i<datamenuBottom.length; i++){
                    datamenuBottom[i].children = await Menu.find({parent_id:datamenuBottom[i]._id})
                    if(datamenuBottom[i].children.length>0){
                        for(j=0; j<datamenuBottom[i].children.length; j++){
                        datamenuBottom[i].children[j].children = await Menu.find({parent_id:datamenuBottom[i].children[j]._id})
                        }
                    }
                }
            }
            //Hiển thị menu chân trang 1
            var datamenuBottom1 = await Menu.find({ keyname: "menu_footer1", parent_id: null })
            if (datamenuBottom1.length > 0) {
                for (i = 0; i < datamenuBottom1.length; i++) {
                    datamenuBottom1[i].children = await Menu.find({ parent_id: datamenuBottom1[i]._id })
                    if (datamenuBottom1[i].children.length > 0) {
                        for (j = 0; j < datamenuBottom1[i].children.length; j++) {
                            datamenuBottom1[i].children[j].children = await Menu.find({ parent_id: datamenuBottom1[i].children[j]._id })
                        }
                    }
                }
            }
            //Hiển thị menu chân trang 1
            var datamenuBottom2 = await Menu.find({ keyname: "menu_footer2", parent_id: null })
            if (datamenuBottom2.length > 0) {
                for (i = 0; i < datamenuBottom2.length; i++) {
                    datamenuBottom2[i].children = await Menu.find({ parent_id: datamenuBottom2[i]._id })
                    if (datamenuBottom2[i].children.length > 0) {
                        for (j = 0; j < datamenuBottom2[i].children.length; j++) {
                            datamenuBottom2[i].children[j].children = await Menu.find({ parent_id: datamenuBottom2[i].children[j]._id })
                        }
                    }
                }
            }
            //Hiển thị menu đối tác chân trang
            var datamenupartner = await Menu.find({ keyname: "partner_bottom", parent_id: null }).sort({ sort: 1 })
            if (datamenupartner.length > 0) {
                for (i = 0; i < datamenupartner.length; i++) {
                    datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
                    if (datamenupartner[i].children.length > 0) {
                        for (j = 0; j < datamenupartner[i].children.length; j++) {
                            datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
                        }
                    }
                }
            }
            // Hiển thị sldier trang chủ (sldier_home)
            var sliderHome = await Photo.find({keyname: "slider_home"})
            //Loại sản phẩm cột phải
            let styleProductHome = await Styleproduct.findOne({focus: 1})
            let listProductStype = []
            if(styleProductHome){
              listProductStype = await Product.find({_id: {$in: styleProductHome.arr_product_ids}}).populate('imageNumber').skip(0).limit(8)
            }else{
              styleProductHome = []
            }
            // Sản phẩm liên quan
            let dataAllProductRelate = await Product.find({$and: [{_id: {$nin: itemcatproduct._id}},{category_id: itemproduct.category_id}]}).populate('imageNumber')
            var tracking=''
            if(query.query.tracking){
              tracking = query.query.tracking
            }
            var country = await Location.aggregate([
              { $match : { COUNTRY_NAME : { $exists: true }} },
              { $project: {
                    "_id": "$_id",
                    "name": "$COUNTRY_NAME",
                    "code": "$COUNTRY_CODE",
                    "country_id": "$COUNTRY_ID",
                    "label": "$COUNTRY_NAME",
                    "id": "$COUNTRY_ID",
                    "idcountry": "$COUNTRY_ID",
                    "value": "$COUNTRY_ID",
                }
              }
            ])
            //res.send(itemproduct.option_product[0].arrChild[0].name)
            res.render('frontend/product/detail', {
                title: itemcatproduct.name,
                image_seo: itemproduct.imagePath,
                csrfToken: req.csrfToken(),
                classBody: 'catalog-view_op1 product-page right-sidebar',
                urlRoot: req.protocol + 's://' + req.get('host'),
                settings: settings,
                menu: datamenu,
                htmlBreakcrum: htmlBreakcrum,
                catproducts_sidebar: catproducts_sidebar,
                datamenuBottom: datamenuBottom,
                datamenuBottom1: datamenuBottom1,
                datamenuBottom2: datamenuBottom2,
                datamenupartner: datamenupartner, // Hiển thị menu đối tác chân trang
                itemproduct: itemproduct,
                gallerys: gallerys,
                itemcatproduct: itemcatproduct,
                styleProduct: styleProduct,
                styleProductHome: styleProductHome,
                listProductStype: listProductStype,
                dataAllProductRelate: dataAllProductRelate,
                tracking: tracking,
                option_product: itemproduct.option_product,
                country: country

              })
        }else{
            next()
        }
    }
}
async function getitemcat(data, itemdata){
    for(i=0; i<data.length; i++){
        if(itemdata.parent_id==data[i]._id){
            return data[i]
        }
    }
}
async function breakcrumtab(itemcat){

    var arr = await []
    //arr[0] = await {slug:'',name:"Trang chủ"}
    if(itemcat.parent_id!=null){
        let itemcat1 = await Catproduct.findOne({_id: itemcat.parent_id})
        //return itemcat1
        arr[0] = {slug:itemcat1.slug,name:itemcat1.name}
        if(itemcat1.parent_id!=null){
            let itemcat2 = await Catproduct.findOne({_id: itemcat1.parent_id})
            arr[1] = await {slug:itemcat2.slug,name:itemcat2.name}
            if(itemcat2.parent_id!=null){
                let itemcat3 = await Catproduct.findOne({_id: itemcat2.parent_id})
                arr[2] = await {slug:itemcat3.slug,name:itemcat3.name}
                if(itemcat3.parent_id!=null){
                    let itemcat4 = await Catproduct.findOne({_id: itemcat3.parent_id})
                    arr[3] = await {slug:itemcat4.slug,name:itemcat4.name}
                }
            }
        }
    }else{
        arr[0] = await {slug:itemcat.slug,name:itemcat.name}
    }
    var datare = arr.reverse()
    return datare;
}
productController.listproduct = async function(req, res, next) {
    var query = await url.parse(req.url,true)
    //res.send(query);
    var data_alias = await Alias.findOne({path: query.path.slice(1)})
    //res.send(data_alias)
    if(data_alias){
        if(data_alias.name_table=="catproduct"){
            let itemCatproduct = await Catproduct.findOne({_id: data_alias.id_table})
            var cat_relate = []
            if(itemCatproduct.parent_id==null){
              cat_relate = await Catproduct.find({parent_id: itemCatproduct._id})
            }
            //res.send(cat_relate);
            var dataSlider = []
            if(itemCatproduct.parent_id==null){
                if(itemCatproduct.imageArray.length>0){
                    dataSlider = await Gallery.find({_id: {$in: itemCatproduct.imageArray}})
                }
            }
            const query = url.parse(req.url,true).query
            var perPage = query.perPage || 18
            var page = query.page || 1
            let listproduct = await Product.find({_id: {$in: itemCatproduct.arr_id_product}})
                .skip((perPage * page) - perPage)
                .limit(perPage)
            var count =  await Product.find({_id: {$in: itemCatproduct.arr_id_product}}).countDocuments()
            // Danh sách nhà cung cấp
            let listSupplier = await Supplier.find({})
            // Danh mục sản phẩm con
            let listCatproductChild = await Catproduct.find({_id: {$in: itemCatproduct.childs}})
            // Loại sản phẩm
            let styleProduct = await Styleproduct.find({})
            // Tạo breakcrum danh mục
            let htmlBreakcrum = await breakcrumtab(itemCatproduct)
            //Cấu hình hệ thống
            let settings = await Setting.findOne({lang: "index"}).populate('logo')
            //Hiển thị menu top
            var datamenu = await Menu.find({keyname:"menu_top",parent_id: null})
            if(datamenu.length>0){
                for(i=0; i<datamenu.length; i++){
                    datamenu[i].children = await Menu.find({parent_id:datamenu[i]._id})
                    if(datamenu[i].children.length>0){
                        for(j=0; j<datamenu[i].children.length; j++){
                        datamenu[i].children[j].children = await Menu.find({parent_id:datamenu[i].children[j]._id})
                        }
                    }
                }
            }
            //Hiển thị menu chân trang
            var datamenuBottom = await Menu.find({keyname:"menu_bottom",parent_id: null})
            if(datamenuBottom.length>0){
                for(i=0; i<datamenuBottom.length; i++){
                datamenuBottom[i].children = await Menu.find({parent_id:datamenuBottom[i]._id})
                if(datamenuBottom[i].children.length>0){
                    for(j=0; j<datamenuBottom[i].children.length; j++){
                    datamenuBottom[i].children[j].children = await Menu.find({parent_id:datamenuBottom[i].children[j]._id})
                    }
                }
                }
            }
            //Hiển thị menu chân trang 1
            var datamenuBottom1 = await Menu.find({ keyname: "menu_footer1", parent_id: null })
            if (datamenuBottom1.length > 0) {
                for (i = 0; i < datamenuBottom1.length; i++) {
                    datamenuBottom1[i].children = await Menu.find({ parent_id: datamenuBottom1[i]._id })
                    if (datamenuBottom1[i].children.length > 0) {
                        for (j = 0; j < datamenuBottom1[i].children.length; j++) {
                            datamenuBottom1[i].children[j].children = await Menu.find({ parent_id: datamenuBottom1[i].children[j]._id })
                        }
                    }
                }
            }
            //Hiển thị menu chân trang 1
            var datamenuBottom2 = await Menu.find({ keyname: "menu_footer2", parent_id: null })
            if (datamenuBottom2.length > 0) {
                for (i = 0; i < datamenuBottom2.length; i++) {
                    datamenuBottom2[i].children = await Menu.find({ parent_id: datamenuBottom2[i]._id })
                    if (datamenuBottom2[i].children.length > 0) {
                        for (j = 0; j < datamenuBottom2[i].children.length; j++) {
                            datamenuBottom2[i].children[j].children = await Menu.find({ parent_id: datamenuBottom2[i].children[j]._id })
                        }
                    }
                }
            }
            //Hiển thị menu đối tác chân trang
            var datamenupartner = await Menu.find({ keyname: "partner_bottom", parent_id: null }).sort({ sort: 1 })
            if (datamenupartner.length > 0) {
                for (i = 0; i < datamenupartner.length; i++) {
                    datamenupartner[i].children = await Menu.find({ parent_id: datamenu[i]._id })
                    if (datamenupartner[i].children.length > 0) {
                        for (j = 0; j < datamenupartner[i].children.length; j++) {
                            datamenupartner[i].children[j].children = await Menu.find({ parent_id: datamenupartner[i].children[j]._id })
                        }
                    }
                }
            }
            //Hiển thị sldier trang chủ (sldier_home)
            var sliderHome = await Photo.find({keyname: "slider_home"})
            //res.send(listproduct);
            var urlRoot= req.protocol + 's://' + req.get('host')
            //res.send(urlRoot);
            res.render('frontend/product/list', {
                title: itemCatproduct.name,
                classBody: 'catalog-view_op1',
                csrfToken: req.csrfToken(),
                urlRoot: req.protocol + 's://' + req.get('host'),
                settings: settings,
                menu: datamenu,
                datamenuBottom: datamenuBottom,
                datamenuBottom1: datamenuBottom1,
                datamenuBottom2: datamenuBottom2,
                datamenupartner: datamenupartner, // Hiển thị menu đối tác chân trang
                itemCatproduct: itemCatproduct,
                dataSlider: dataSlider, // Slider danh mục
                listproduct: listproduct,
                htmlBreakcrum: htmlBreakcrum, // Breakcrum danh mục
                styleProduct: styleProduct,
                listCatproductChild: listCatproductChild, //Danh mục sản phẩm con
                listSupplier: listSupplier, // Danh sách nhà cung cấp
                cat_relate: cat_relate,
                //Phân trang
                current: page,
                pages: Math.ceil(count / perPage),
                pagination: { page: page, pageCount: Math.ceil(count / perPage), itemCatproduct: itemCatproduct}
              })
        }else{
            next()
        }
    }
}
module.exports = productController;
