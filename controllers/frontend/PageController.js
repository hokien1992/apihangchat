var express = require('express')
//Chèn models
var Page = require('../../models/page')
var New = require('../../models/new')
var Catnew = require('../../models/catnew')
var Setting = require('../../models/setting')
var Menu = require('../../models/menu')
var Photo = require('../../models/photo')
var Alias = require("../../models/alias")
var Gallery = require("../../models/gallery")
var Product = require('../../models/product')
var Catproduct = require('../../models/catproduct')
var pageController = {}
const url = require('url')
pageController.detail = async function(req,res,next) {
    var query = await url.parse(req.url,true)
    var data_alias = await Alias.findOne({path: query.path.slice(1)})
    //res.send(data_alias)
    if(data_alias.name_table=="Page"){

      let products = await Product.find({})
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
      //res.send(catproducts_sidebar)
      let catproducts = await Catproduct.find({
        parent_id: null,
        home: 1
       }).populate('imageNumber')

        let itemproduct = await Page.findOne({_id: data_alias.id_table})
        let listPage = await Page.find({home: 1})
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
        // Tin mới nhất
        let dataNewsFocus = await New.find({focus:1})
        if(itemproduct.focus!=1){
            res.render('frontend/page/page', {
              title: itemproduct.name,
              classBody: 'catalog-view_op1 product-page right-sidebar',
              urlRoot: req.protocol + 's://' + req.get('host'),
              settings: settings,
              menu: datamenu,
              catproducts_sidebar: catproducts_sidebar,
              datamenuBottom: datamenuBottom,
              datamenuBottom1: datamenuBottom1,
              datamenuBottom2: datamenuBottom2,
              datamenupartner: datamenupartner, // Hiển thị menu đối tác chân trang
              itemproduct:itemproduct,
              dataNewsFocus: dataNewsFocus,
              listPage: listPage
              })
        }else{
            res.render('frontend/page/contact', {
                title: itemproduct.name,
                classBody: 'catalog-view_op1 product-page right-sidebar',
                urlRoot: req.protocol + 's://' + req.get('host'),
                settings: settings,
                catproducts_sidebar: catproducts_sidebar,
                menu: datamenu,
                datamenuBottom: datamenuBottom,
                datamenuBottom1: datamenuBottom1,
                datamenuBottom2: datamenuBottom2,
                itemproduct:itemproduct,
                dataNewsFocus: dataNewsFocus,
                })
        }

    }else{
        next()
    }
}
module.exports = pageController
