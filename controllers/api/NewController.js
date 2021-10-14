
const express = require('express')
const slugify = require('slugify')
slugify.extend({'đ': 'd'})
const New = require("../../models/new")
const Catnew = require('../../models/catnew')
const Tag = require("../../models/tag")
const Alias = require('../../models/alias')
const url = require('url')
const newController = {}
newController.list = function(req, res, next){
    const filter = {}
    const query = url.parse(req.url,true).query
    //===================paginattion
    var perPage = query.perPage || 10
    var page = query.page || 1

    if(query){
        const keyword = new RegExp(query.keyword, 'i')
        filter.$or = [{name: keyword}, {description:keyword}]

        New.find(filter)
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('category_id')
        .populate('author').populate('tags').populate('imageNumber').exec((err, posts) => {
            New.find(filter).countDocuments().exec(function(err, count) {
                posts.test = {name: "ok"}
                res.send({
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage),
                    count:count,
                })
            })
        })
    }else{
        New.populate('author').populate('tags').exec((err, post) => {
            res.send(post)
        })
    }
}
newController.getAlls = function(req, res, next) {
    New.find({}).exec((err, post) => {
        res.send(post)
    })
}
newController.getAll = function(req, res, next) {
    const filter = {}
    const query = url.parse(req.url,true).query
    if(query.author){
        filter.author = query.author;
    }
    New.find(filter).populate('author').populate('tags').exec((err, post) => {
        res.send(post)
    })
}
newController.show =async function(req, res) {

    const postId = await req.params.id
    const data = await New.findById(postId).populate('category_id').populate('author').populate('tags').populate('imageNumber')
    //res.send(data)
    let limitIdCat = await data.limitCat.map(function(item, i){
        return item.value
    })
    var dataLimitCatproduct = await Catnew.find({_id: {$in: limitIdCat}})

    res.send({
        data: data,
        dataLimitCatproduct: dataLimitCatproduct
    })
}
newController.create = function(req, res) {
    res.send({message:'View tạo tài khoản'})
};
//Add record
newController.store = function(req, res) {
    var datas = {
        "name": req.body.name,
        "alias": slugify(req.body.name,'-'),
        "imagePath": req.body.imagePath,
        "description": req.body.description,
        "detail": req.body.detail,
        "price": req.body.price,
        "author": req.body.author,
    }
    var post = new New(datas);
        post.save(function(err, newPost){
            res.send(newPost)
        })
}
newController.update = function(req, res) {
    var messenger = {};
    var data = {
        name: req.body.name,
        description: req.body.description,
    }
    New.findOne({'_id': req.params.id}, function(err, result){
        if(result){
            New.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.send(results);
            });
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật tin tức"});
        }
    });
}
newController.delete = (req, res) => {
    New.remove({_id: req.params.id}, function(err) {
      res.json({ "message": "Xóa tin tức thành công!" })
    })
}
// Thêm tin tức
newController.saveProductAndTag = async (req, res, next) => {
    var request = await req.body
    var dataError = {}
    if(request.name==''){
        dataError.name = "Không được bỏ trống trường này!"
    }
    if(request.category_id==null || request.category_id==''){
        dataError.category_id = "Bạn phải chọn danh mục sản phẩm!"
    }
    if(request.limitCat.length==0 || request.limitCat==null || request.limitCat==''){
        dataError.limitCat = "Bạn chưa chọn danh mục liên quan!"
    }
    if(Object.keys(dataError).length>0){
        dataError.default = "Đã có lỗi xảy ra"
        res.send({
            count: Object.keys(dataError).length,
            dataError: dataError,
            status: 0
        })
    }else{
      const datatags = await request.tags.map(function(item, index){
          return { label: item };  // this is loop and prepare tags array to save,
      })
      //Thêm tags tin tức nếu có tags trùng thì tự động trả về false còn không thì sẽ đi tiếp
      let datatags1 = Tag.insertMany(datatags, {ordered: false},function(err, result){
          return result
      })
      var post = await new New(request)
      //Lấy id tags để update lại
      let dataTagsWithLabel = await Tag.find({label: {$in: request.tags}})
      post.tags = await dataTagsWithLabel.map(function(item){
          return item._id
      })
      post.alias = await slugify(req.body.name, {
              replacement: '-',    // replace spaces with replacement
              remove: null,        // regex to remove characters
              lower: true          // result in lower case
            })
      let savepost = New.insertMany([post], {ordered: false},function(err, result){
          return result
      })
      if(post){
          // update id trong danh mục liên quan
          var arr_id_cat_relate = await request.limitCat.map(function(item, i){
              return item.value
          })
          for(i=0; i<arr_id_cat_relate.length;i++){
              var itemcatrelate = await Catnew.findOne({_id: arr_id_cat_relate[i]})
              itemcatrelate.arr_id_product[itemcatrelate.arr_id_product.length] = await post._id
              var itemdatacatreldate = await Catnew.findByIdAndUpdate(arr_id_cat_relate[i], { $set: {arr_id_product: itemcatrelate.arr_id_product}}, { new: true })
          }
          // Thêm danh mục tin tức
          let category_id = await post.category_id
          let data_category = await Catnew.findOne({_id:category_id})
          if(data_category.parent_id!=null){
              var paths = await postdataparentid(data_category,post._id)+'/'+data_category.alias+'/'+post.alias
          }else{
              var paths = await data_category.alias+'/'+post.alias
          }
          //Lấy id tags để update lại
          let dataTagsWithLabel = await Tag.find({label: {$in: request.tags}})
          let arrIdTags = await dataTagsWithLabel.map(function(item){
              return item._id
          })
          //Update dữ liệu tin tức
          let data_post_product = await New.findByIdAndUpdate(post._id, { $set: {slug:paths,tags:arrIdTags}}, { new: true })

          if(data_post_product){
              let data_alias = await {
                  "name": data_post_product.name,
                  "title": data_post_product.name,
                  "path": paths,
                  "alias": data_post_product.alias,
                  "slug": paths,
                  "name_table": "news",
                  "id_table": data_post_product._id,
              }
              var postalias = await new Alias(data_alias)
              postalias.save(function(err, result){
                  return result
              })
          }
          res.send({
            post:post,
            postalias:postalias,
            status: 1
          })
      }
    }

}
async function postdataparentid(data_category,id){
    let ids = id
    let category_id = await data_category.parent_id
    let data_categorys = await Catnew.findById(data_category.parent_id)
    if(data_categorys.parent_id!=null){
        return await postdataparentid(data_categorys,ids)+'/'+data_categorys.alias
    }
    return data_categorys.alias

}
newController.getAlltags = function(req, res, next){
    Tag.aggregate([
        { "$project": {
            "value": "$_id",
            "label": "$label",
        }}
    ], function(err, tags) {
        if (err)
            res.send(err)
        else if (!tags)
            res.send(404)
        else
            res.send(tags)
    })
}
// Update tin tức
newController.saveProductAndTagAsync = async function(req, res, next){
    var request = await req.body
    var dataError = {}
    if(request.name==''){
        dataError.name = "Không được bỏ trống trường này!"
    }
    if(request.category_id==null || request.category_id==''){
        dataError.category_id = "Bạn phải chọn danh mục sản phẩm!"
    }
    if(request.limitCat.length==0 || request.limitCat==null || request.limitCat==''){
        dataError.limitCat = "Bạn chưa chọn danh mục liên quan!"
    }
    if(Object.keys(dataError).length>0){
        dataError.default = "Đã có lỗi xảy ra"
        res.send({
            count: Object.keys(dataError).length,
            dataError: dataError,
            status: 0
        })
    }else{
      //Thêm hoặc update tags
      const datatags = await request.tags.map(function(item, index){
          return { label: item };  // this is loop and prepare tags array to save,
      })
      //Thêm tags sản phẩm nếu có tags trùng thì tự động trả về false còn không thì sẽ đi tiếp
      let datatags1 = Tag.insertMany(datatags, {ordered: false},function(err, result){
          return result
      })
      //Kết thúc thêm hoặc update tags
      var itempost = await New.findById(request._id)
      // update id trong danh mục liên quan
      var arr_id_cat_relate = await request.limitCat.map(function(item, i){
          return item.value
      })
      for(i=0; i<arr_id_cat_relate.length;i++){
          var itemcatrelate = await Catnew.findOne({_id: arr_id_cat_relate[i]})
          itemcatrelate.arr_id_product[itemcatrelate.arr_id_product.length] = await itempost._id
          var itemdatacatreldate = await Catnew.findByIdAndUpdate(arr_id_cat_relate[i], { $set: {arr_id_product: itemcatrelate.arr_id_product}}, { new: true })
      }
      // Update danh mục sản phẩm không được chọn
      if(request.limitCat.length>0){
          let dataNotCatproduct = await Catnew.find({_id: {$nin: arr_id_cat_relate}})
          for(j=0; j < dataNotCatproduct.length; j++){
              //Loại bỏ id sản phẩm khỏi mảng id sản phẩm chứa trong loại sản phẩm
              var index_id_product_in_cat = await dataNotCatproduct[j].arr_id_product.indexOf(itempost._id)
              var arr_id_product_update_not_cats = await dataNotCatproduct[j].arr_id_product
              var arr_id_product_update_not_cat = await arr_id_product_update_not_cats.splice(index_id_product_in_cat,1)
              if(index_id_product_in_cat>-1){
                  var data_not_cat = await Catnew.findByIdAndUpdate(dataNotCatproduct[j]._id, { $set: {arr_id_product: arr_id_product_update_not_cats}}, { new: true })
              }
          }
      }

      // update slug
      let data_category = await Catnew.findOne({ _id: req.body.category_id })
      if (data_category.parent_id != null) {
          var paths = await postdataparentid(data_category, itempost._id) + '/' + data_category.alias + '/' + slugify(req.body.name, {
              replacement: '-',    // replace spaces with replacement
              remove: null,        // regex to remove characters
              lower: true          // result in lower case
          })
      } else {
          var paths = await data_category.alias + '/' + slugify(req.body.name, {
              replacement: '-',    // replace spaces with replacement
              remove: null,        // regex to remove characters
              lower: true          // result in lower case
          })
      }

      var post_data_product = await {
          name: req.body.name,
          alias: slugify(req.body.name, {
              replacement: '-',    // replace spaces with replacement
              remove: null,        // regex to remove characters
              lower: true          // result in lower case
          }),
          slug: paths,
          description: req.body.description,
          detail: req.body.detail,
          category_id: req.body.category_id,
          imagePath: req.body.imagePath,
          imageArray: req.body.imageArray,
          imageNumber: req.body.imageNumber,
          limitCat: req.body.limitCat,
          count: req.body.count,
      }
      let data_product = await New.findByIdAndUpdate(itempost._id, { $set: post_data_product }, { new: true })
      if(data_product){
          let data_alias = await {
              "name": data_product.name,
              "title": data_product.name,
              "alias": data_product.alias,
              "slug": paths,
              "path": paths,
              "name_table": "news",
              "id_table": itempost._id,
          }
          var dataItemAlias = await Alias.findOne({slug: itempost.slug})
          if(dataItemAlias){
              var datapostalias = await Alias.findByIdAndUpdate(dataItemAlias._id, { $set: data_alias}, { new: true })
          }else{
              var postalias = new Alias(data_alias)
              postalias.save(function(err, result) {
                  return result
              })
          }
      }
      res.send({data_product: data_product, status: 1})
    }

}
newController.remove = function(req, res){
    New.findByIdAndRemove(req.params.id, (err, post) => {
        if(err){
            res.send(err)
        }else{
            res.send({post: post, message:'deleted'})
        }
    })
}
newController.checkHome = async function(req, res){
    const itemstyleproduct = await New.findOne({_id: req.body.id})
    if(req.body.type=="home"){
        if(itemstyleproduct.home==1){
            var data = await {home:0,checkHome:'false'}
            var itempost = await New.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {home:1,checkHome:'true'}
            var itempost = await New.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
newController.checkFocus = async function(req, res){
    const itemstyleproduct = await New.findOne({_id: req.body.id})
    if(req.body.type=="focus"){
        if(itemstyleproduct.focus==1){
            var data = await {focus:0,checkFocus:'false'}
            var itempost = await New.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }else{
            var data = await {focus:1,checkFocus:'true'}
            var itempost = await New.findByIdAndUpdate(req.body.id, { $set: data}, { new: true })
        }
    }
    res.send(itempost)
}
//get data with url and link
newController.getDataUrl = function(req, res){
    New.aggregate([
        { "$project": {
            "id": "$_id",
            "value": "$slug",
            "label": "$name"
        }}
    ]).exec((err, post) => {
        res.send(post)
    })
}
module.exports = newController
