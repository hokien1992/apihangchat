var express = require('express')
//Chèn models
var New = require('../../models/new')
var Catnew = require('../../models/catnew')
var Setting = require('../../models/setting')
var Menu = require('../../models/menu')
var Photo = require('../../models/photo')
var Alias = require("../../models/alias")
var Gallery = require("../../models/gallery")
var newController = {}
const url = require('url')
newController.detail = async function(req,res,next) {
    var query = url.parse(req.url,true)
    if(query.path.slice(1)!=''){
        var data_alias = await Alias.findOne({path: query.path.slice(1)})
        if(data_alias.name_table=="news"){
            let itemproduct = await New.findOne({_id: data_alias.id_table})
            var gallerys = await Gallery.find({_id: {$in: itemproduct.imageArray}})
            // Tạo breakcrum danh mục
            let datacat = await Catnew.find({})
            let itemcatproduct = await Catnew.findOne({_id: itemproduct.category_id})
            let htmlBreakcrum = await breakcrumtab(itemcatproduct)
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
            // Sản phẩm liên quan
            let dataAllProductRelate = await New.find({$and: [{_id: {$nin: itemcatproduct._id}},{category_id: itemproduct.category_id}]}).populate('imageNumber')
            // Tin mới nhất
            let dataNewsFocus = await New.find({focus:1})
            res.render('frontend/news/detail', {
                title: 'Chi tiết sản phẩm',
                classBody: 'catalog-view_op1 product-page right-sidebar',
                urlRoot: req.protocol + 's://' + req.get('host'),
                settings: settings,
                menu: datamenu,
                htmlBreakcrum: htmlBreakcrum,
                datamenuBottom: datamenuBottom,
                datamenuBottom1: datamenuBottom1,
                datamenuBottom2: datamenuBottom2,
                datamenupartner: datamenupartner,
                itemproduct:itemproduct,
                gallerys:gallerys,
                itemcatproduct:itemcatproduct,
                dataAllProductRelate: dataAllProductRelate,
                dataNewsFocus: dataNewsFocus,
                })
        }else{
            next()
        }
    }else{
        next()
    }

}
async function breakcrumtab(itemcat){

    var arr = await []
    //arr[0] = await {slug:'',name:"Trang chủ"}
    if(itemcat.parent_id!=null){
        let itemcat1 = await Catnew.findOne({_id: itemcat.parent_id})
        //return itemcat1
        arr[0] = {slug:itemcat1.slug,name:itemcat1.name}
        if(itemcat1.parent_id!=null){
            let itemcat2 = await Catnew.findOne({_id: itemcat1.parent_id})
            arr[1] = await {slug:itemcat2.slug,name:itemcat2.name}
            if(itemcat2.parent_id!=null){
                let itemcat3 = await Catnew.findOne({_id: itemcat2.parent_id})
                arr[2] = await {slug:itemcat3.slug,name:itemcat3.name}
                if(itemcat3.parent_id!=null){
                    let itemcat4 = await Catnew.findOne({_id: itemcat3.parent_id})
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
newController.list = async function(req, res, next) {
    var query = await url.parse(req.url,true)
    var data_alias = await Alias.findOne({path: query.path.slice(1)})
    if(data_alias){
        if(data_alias.name_table=="catnew"){
            //
            let itemCatnew = await Catnew.findOne({_id: data_alias.id_table})
            //res.send(itemCatproduct)
            let listnew = await New.find({_id: {$in: itemCatnew.arr_id_product}})
            // Tạo breakcrum danh mục
            let htmlBreakcrum = await breakcrumtab(itemCatnew)
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
            // Tin mới nhất
            let dataNewsFocus = await New.find({focus:1})
            //  Danh sách danh mục tin
            let dataCatNewsFocus = await Catnew.find({focus:1})
            res.render('frontend/news/list', {
                title: itemCatnew.name,
                classBody: 'catalog-view_op1',
                urlRoot: req.protocol + 's://' + req.get('host'),
                settings: settings,
                menu: datamenu,
                datamenuBottom: datamenuBottom,
                datamenuBottom1: datamenuBottom1,
                datamenuBottom2: datamenuBottom2,
                datamenupartner: datamenupartner,
                itemCatnew: itemCatnew,
                listnew: listnew,
                dataNewsFocus: dataNewsFocus,
                dataCatNewsFocus: dataCatNewsFocus,
                htmlBreakcrum: htmlBreakcrum, // Breakcrum danh mục
              })
        }else{
            next()
        }
    }
}
module.exports = newController;
