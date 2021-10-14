var express = require('express')
var bcrypt = require('bcryptjs')
//
var Handlebars     = require('handlebars')
var HandlebarsIntl = require('handlebars-intl')
//Chèn models
var Product = require('../../models/product')
var Catproduct = require('../../models/catproduct')
var Styleproduct = require('../../models/styleproduct')
var Supplier = require('../../models/supplier')
var Setting = require('../../models/setting')
var Menu = require('../../models/menu')
var Photo = require('../../models/photo')
var Alias = require("../../models/alias")
var Gallery = require("../../models/gallery")

var productController = {}
var router = express.Router()
const url = require('url')
productController.search = async function(req, res, next){
  const filter = {}
  const query = url.parse(req.url, true).query
  var keyword = query.name
  filter.name = { $regex: query.name, $options: 'i' }
  var listproduct = await Product.find(filter)
  //res.send(listproduct)
  // Loại sản phẩm
  let styleProduct = await Styleproduct.find({})
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
  res.render('frontend/search/index', {
      title: 'Kết quả tìm kiếm',
      classBody: 'catalog-view_op1',
      urlRoot: req.protocol + 's://' + req.get('host'),
      settings: settings,
      menu: datamenu,
      datamenuBottom: datamenuBottom,
      datamenuBottom1: datamenuBottom1,
      datamenuBottom2: datamenuBottom2,
      datamenupartner: datamenupartner,
      styleProduct: styleProduct,
      listproduct: listproduct,
    })
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
    var data_alias = await Alias.findOne({path: query.path.slice(1)})
    if(data_alias){
        if(data_alias.name_table=="catproduct"){
            //
            let itemCatproduct = await Catproduct.findOne({_id: data_alias.id_table})
            var dataSlider = []
            if(itemCatproduct.parent_id==null){
                if(itemCatproduct.imageArray.length>0){
                    dataSlider = await Gallery.find({_id: {$in: itemCatproduct.imageArray}})
                }
            }
            //res.send(dataSlider)
            let listproduct = await Product.find({_id: {$in: itemCatproduct.arr_id_product}})
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
            //Hiển thị sldier trang chủ (sldier_home)
            var sliderHome = await Photo.find({keyname: "slider_home"})
            res.render('frontend/product/list', {
                title: 'Danh sách sản phẩm',
                classBody: 'catalog-view_op1',
                urlRoot: req.protocol + 's://' + req.get('host'),
                settings: settings,
                menu: datamenu,
                datamenuBottom: datamenuBottom,
                datamenuBottom1: datamenuBottom1,
                datamenuBottom2: datamenuBottom2,
                itemCatproduct: itemCatproduct,
                dataSlider: dataSlider, // Slider danh mục
                listproduct: listproduct,
                htmlBreakcrum: htmlBreakcrum, // Breakcrum danh mục
                styleProduct: styleProduct,
                listCatproductChild: listCatproductChild, //Danh mục sản phẩm con
                listSupplier: listSupplier, // Danh sách nhà cung cấp
              })
        }else{
            next()
        }
    }
}
module.exports = productController;
