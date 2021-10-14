const express = require('express')
const slugify = require('slugify')
slugify.extend({ 'đ': 'd' })
const Product = require("../../models/product")
const Tag = require("../../models/tag")
const Catproduct = require('../../models/catproduct')
const Styleproduct = require('../../models/styleproduct')
const Supplierproduct = require('../../models/supplier')
const Alias = require('../../models/alias')
const Optionproduct = require('../../models/option_product')
const url = require('url')
const productController = {}
productController.updateAllProduct = async function(req, res, next){
    var data = await Product.find().sort( { _id: -1 } )
    res.send(data)
}
productController.list = async function(req, res, next) {
    const filter = {}
    const query = url.parse(req.url, true).query
    //=================== paginattion
    var perPage = 10
    var page = query.page || 1

    if (query) {
        const keyword = new RegExp(query.keyword, 'i')
        if(keyword!=''){
            filter.$or = [{ name: keyword }, { description: keyword }]
            //filter.$and[0] = { $or:[{ name: keyword }, { description: keyword }] }
            $product = await Product.find(filter)
        }
        filter.$or = [{ name: keyword }, { description: keyword }]
        var posts = await Product.find(filter).skip((perPage * page) - perPage).limit(perPage).populate('category_id').populate('author').populate('tags').populate('imageNumber').sort( { _id: -1 } )
        var count = await Product.find(filter).countDocuments()
        res.send({
            posts: posts,
            pages: Math.ceil(count / perPage),
            current: page,
        })
    } else {
        var posts = await Product.populate('author').populate('tags').sort( { _id: -1 } )
        res.send({
            posts: posts,
            pages: Math.ceil(count / perPage)
        })
    }
}
productController.getAlls = function(req, res, next) {
    Product.find({}).exec((err, post) => {
        res.send(post)
    })
}
productController.getAll = function(req, res, next) {
    const filter = {}
    const query = url.parse(req.url, true).query
    if (query.author) {
        filter.author = query.author;
    }
    Product.find(filter).populate('author').populate('tags').exec((err, post) => {
        res.send(post)
    })
}
productController.show = async function(req, res) {
    const postId = await req.params.id
    const data = await Product.findById(postId).populate('category_id').populate('tags').populate('imageNumber')
    const listStyle = await Styleproduct.find({ _id: { $in: data.arr_style_ids } })
    const itemSupplier = await Supplierproduct.findOne({ _id: data.supplier_id })
    let limitIdCat = await data.limitCat.map(function(item, i) {
        return item.value
    })
    const dataLimitCatproduct = await Catproduct.find({ _id: { $in: limitIdCat } })
    var data_option_product = await Optionproduct.find({product_id: data._id, parent_id: null})
    for(i=0;i<data_option_product.length;i++){
      data_option_product[i].arrChild = await Optionproduct.find({parent_id: data_option_product[i]._id})
      // for(j=0; j<data_option_product[i].arrChild.length; j++){
      //   data_option_product[i].arrChild[j].arrChildChild = data.option_product[i].dataChild
      // }
      // data_option_product[i].dataChild = data.option_product[i].dataChild
    }
    res.send({
        data: data,
        listStyle: listStyle,
        itemSupplier: itemSupplier,
        dataLimitCatproduct: dataLimitCatproduct,
        data_option_product: data_option_product,
    })
}
// Thêm sản phẩm
productController.saveProductAndTag = async(req, res, next) => {
    var request = await req.body
    var dataError = {}
    if(request.name==''){
        dataError.name = "Không được bỏ trống trường này!"
    }
    // if(request.price==0){
    //     dataError.  = "Bạn phải nhập giá!"
    // }
    if(!Number.isInteger(req.body.price)){
        dataError.price = "Bạn phải nhập số!"
    }
    // if(request.price_old==0){
    //     dataError.price_old = "Bạn phải nhập giá!"
    // }
    if(!Number.isInteger(req.body.price_old)){
        dataError.price_old = "Bạn phải nhập số!"
    }
    if(!Number.isInteger(req.body.price_sale)){
        dataError.price_sale = "Bạn phải nhập số!"
    }
    if(request.category_id==null || request.category_id==''){
        dataError.category_id = "Bạn phải chọn danh mục sản phẩm!"
    }
    if(request.supplier_id==null || request.supplier_id=='' || request.supplier_id==undefined){
        dataError.supplier_id = "Bạn phải chọn nhà cung cấp!"
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
        const datatags = await request.tags.map(function(item, index) {
            return { label: item }; // this is loop and prepare tags array to save,
        })
        //Thêm tags sản phẩm nếu có tags trùng thì tự động trả về false còn không thì sẽ đi tiếp
        let datatags1 = Tag.insertMany(datatags, { ordered: false }, function(err, result) {
            return result
        })
        var post = new Product(request)

        if(post.price_sale!=0){
            post.epay = Math.round(1.25*post.price_sale/4800 * 1000)/1000
            var p = (parseFloat(post.price)-parseFloat(post.price_sale))*100/post.price
            post.percent = Math.ceil(p)
        }else{
            post.percent = 0
            post.epay = Math.round(1.25*post.price/4800 * 1000)/1000
        }
        //Lấy id tags để update lại
        let dataTagsWithLabel = await Tag.find({ label: { $in: request.tags } })
        post.tags = await dataTagsWithLabel.map(function(item) {
            return item._id
        })
        post.arr_style_ids = request.style_ids
        post.alias = await slugify(req.body.name, {
            replacement: '-',    // replace spaces with replacement
            remove: null,        // regex to remove characters
            lower: true          // result in lower case
        })

        if (post) {
            // Thêm loại sản phẩm
            if(request.style_ids.length>0){
                for (i = 0; i < post.arr_style_ids.length; i++) {
                    let itemStyle = await Styleproduct.findOne({ _id: post.arr_style_ids[i] })
                    itemStyle.arr_product_ids[itemStyle.arr_product_ids.length] = await post._id
                    var datastyle = await Styleproduct.findByIdAndUpdate(itemStyle._id, { $set: { arr_product_ids: itemStyle.arr_product_ids } }, { new: true })
                }
            }
            // Trong danh mục liên quanif
            if(request.limitCat.length>0){
                var arr_id_cat_relate = await request.limitCat.map(function(item, i) {
                    return item.value
                })
                for (i = 0; i < arr_id_cat_relate.length; i++) {
                    var itemcatrelate = await Catproduct.findOne({ _id: arr_id_cat_relate[i] })
                    itemcatrelate.arr_id_product[itemcatrelate.arr_id_product.length] = await post._id
                    var itemdatacatreldate = await Catproduct.findByIdAndUpdate(arr_id_cat_relate[i], { $set: { arr_id_product: itemcatrelate.arr_id_product } }, { new: true })
                }
            }
            // Thêm danh mục sản phẩm
            let category_id = await post.category_id
            let data_category = await Catproduct.findOne({ _id: category_id })
            if (data_category.parent_id != null) {
                var paths = await postdataparentid(data_category, post._id) + '/' + data_category.alias + '/' + post.alias
            } else {
                var paths = await data_category.alias + '/' + post.alias
            }
            //Lấy id tags để update lại
            let dataTagsWithLabel = await Tag.find({ label: { $in: request.tags } })
            let arrIdTags = await dataTagsWithLabel.map(function(item) {
                return item._id
            })
            //Update dữ liệu sản phẩm
            post.slug = paths
            post.tags = arrIdTags
            let data_alias = await {
                "name": post.name,
                "title": post.name,
                "path": paths,
                "alias": post.alias,
                "slug": paths,
                "name_table": "product",
                "id_table": post._id,
            }
            var postalias = await new Alias(data_alias)
            postalias.save(function(err, result) {
                return result
            })
            // Thêm thuộc tính sản phẩm
            var arr_option_product = []
            if(req.body.option_product.length>0){
              for(i=0;i<req.body.option_product.length;i++){
                var data_option = {
                    name: req.body.option_product[i].name,
                    type: req.body.option_product[i].type,
                    product_id: post._id,
                    dataChild: req.body.option_product[i].dataChild,
                }
                var postOptionParent = new Optionproduct(data_option)
                arr_option_product[i] = postOptionParent
                var resOptionParent = postOptionParent.save(function(err, newPost2) {
                    return newPost2
                })
                if(req.body.option_product[i].arrChild.length>0){
                    for(j=0;j<req.body.option_product[i].arrChild.length;j++){
                        var data_option_child = {
                            name: req.body.option_product[i].arrChild[j].name,
                            parent_id: postOptionParent._id,
                            product_id: post._id,
                            qty: parseInt(req.body.option_product[i].arrChild[j].qty),
                            stock: req.body.option_product[i].arrChild[j].stock,
                            price: parseInt(req.body.option_product[i].arrChild[j].price),
                            price_prefix: req.body.option_product[i].arrChild[j].price_prefix,
                            point: parseInt(req.body.option_product[i].arrChild[j].point),
                            point_prefix: req.body.option_product[i].arrChild[j].point_prefix,
                            weight: parseInt(req.body.option_product[i].arrChild[j].weight),
                            weight_prefix: req.body.option_product[i].arrChild[j].weight_prefix,
                            arrChildChild: req.body.option_product[i].dataChild,
                        }
                        var postOptionChild = new Optionproduct(data_option_child)
                        arr_option_product[i].arrChild[j] = postOptionChild;
                        var resOptionChild = postOptionChild.save(function(err, newPost1) {
                            return newPost1
                        })
                    }

                }
              }
            }
            post.option_product = arr_option_product
            post.data_option_product = arr_option_product
            let savepost = await Product.insertMany([post], { ordered: false }, function(err, result) {
              return result
            })
            res.send({
                post: post,
                postalias: postalias,
                data_post_product: post,
                status: 1
            })
        }else {
            res.send({ message: 'Not success!' })
        }
    }

}
productController.getAlltags = function(req, res, next) {
    Tag.aggregate([{
        "$project": {
            "value": "$_id",
            "label": "$label",
        }
    }], function(err, tags) {
        if (err)
            res.send(err)
        else if (!tags)
            res.send(404)
        else
            res.send(tags)
    })
}
// Update sản phẩm
productController.saveProductAndTagAsync = async function(req, res, next) {
    var request = await req.body
    var dataError = {}
    if(request.name==''){
        dataError.name = "Không được bỏ trống trường này!"
    }
    if(!Number.isInteger(req.body.price)){
        dataError.price = "Bạn phải nhập số!"
    }
    if(!Number.isInteger(req.body.price_old)){
        dataError.price_old = "Bạn phải nhập số!"
    }
    if(!Number.isInteger(req.body.price_sale)){
        dataError.price_sale = "Bạn phải nhập số!"
    }
    if(request.category_id==null || request.category_id==''){
        dataError.category_id = "Bạn phải chọn danh mục sản phẩm!"
    }
    if(request.supplier_id==null || request.supplier_id=='' || request.supplier_id==undefined){
        dataError.supplier_id = "Bạn phải chọn nhà cung cấp!"
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
        const datatags = await request.tags.map(function(item, index) {
            return { label: item }; // this is loop and prepare tags array to save,
        })
        //Thêm tags sản phẩm nếu có tags trùng thì tự động trả về false còn không thì sẽ đi tiếp
        let datatags1 = Tag.insertMany(datatags, { ordered: false }, function(err, result) {
            return result
        })
        //Kết thúc thêm hoặc update tags
        var itempost = await Product.findById(req.body._id)
        // Thêm thuộc tính sản phẩm
        if(itempost){
          console.log(req.body.option_product)
            if(req.body.option_product.length>0){
                var arr_option_product = []
                for(i=0;i<req.body.option_product.length;i++){
                    // Update thuộc tính sản phẩm
                    var data_option = {
                        name: req.body.option_product[i].name,
                        type: req.body.option_product[i].type,
                        product_id: itempost._id,
                        dataChild: req.body.option_product[i].dataChild,
                    }
                    if(req.body.option_product[i].product_id){
                        var resOptionParent = await Optionproduct.findByIdAndUpdate(req.body.option_product[i]._id, { $set: data_option }, { new: true },function(err, result){
                            return result
                        })
                        arr_option_product[i] = resOptionParent
                        // update thuộc tính
                        if(req.body.option_product[i].arrChild.length>0){
                            for(j=0;j<req.body.option_product[i].arrChild.length;j++){
                                var data_option_child = {
                                    name: req.body.option_product[i].arrChild[j].name,
                                    parent_id: req.body.option_product[i]._id,
                                    product_id: itempost._id,
                                    qty: parseInt(req.body.option_product[i].arrChild[j].qty),
                                    stock: req.body.option_product[i].arrChild[j].stock,
                                    price: parseInt(req.body.option_product[i].arrChild[j].price),
                                    price_prefix: req.body.option_product[i].arrChild[j].price_prefix,
                                    point: parseInt(req.body.option_product[i].arrChild[j].point),
                                    point_prefix: req.body.option_product[i].arrChild[j].point_prefix,
                                    weight: parseInt(req.body.option_product[i].arrChild[j].weight),
                                    weight_prefix: req.body.option_product[i].arrChild[j].weight_prefix,
                                    arrChildChild: req.body.option_product[i].dataChild
                                }
                                if(req.body.option_product[i].arrChild[j].parent_id){
                                    var resOptionChild = await Optionproduct.findByIdAndUpdate(req.body.option_product[i].arrChild[j]._id, { $set: data_option_child }, { new: true },function(err, result){
                                        return result
                                    })
                                    arr_option_product[i].arrChild[j] = resOptionChild;
                                }else{
                                    var postOptionChild = new Optionproduct(data_option_child)
                                    arr_option_product[i].arrChild[j] = postOptionChild;
                                    var resOptionChild = postOptionChild.save(function(err, result){
                                        return result
                                    })
                                }
                            }
                        }
                    }else{
                        var postOptionParent = new Optionproduct(data_option)
                        arr_option_product[i] = postOptionParent
                        var resOptionParent = postOptionParent.save(function(err, result){
                            return result
                        })
                        if(req.body.option_product[i].arrChild.length>0){
                            for(j=0;j<req.body.option_product[i].arrChild.length;j++){
                                var data_option_child = {
                                    name: req.body.option_product[i].arrChild[j].name,
                                    parent_id: postOptionParent._id,
                                    product_id: itempost._id,
                                    qty: parseInt(req.body.option_product[i].arrChild[j].qty),
                                    stock: req.body.option_product[i].arrChild[j].stock,
                                    price: parseInt(req.body.option_product[i].arrChild[j].price),
                                    price_prefix: req.body.option_product[i].arrChild[j].price_prefix,
                                    point: parseInt(req.body.option_product[i].arrChild[j].point),
                                    point_prefix: req.body.option_product[i].arrChild[j].point_prefix,
                                    weight: parseInt(req.body.option_product[i].arrChild[j].weight),
                                    weight_prefix: req.body.option_product[i].arrChild[j].weight_prefix,
                                    arrChildChild: req.body.option_product[i].dataChild
                                }
                                var postOptionChild = new Optionproduct(data_option_child)
                                arr_option_product[i].arrChild[j] = postOptionChild;
                                var resOptionChild = postOptionChild.save(function(err, result){
                                  return result
                                })
                            }
                        } //End if
                    }
                    // end if
                }
            }
        }
        //Kết thúc thuộc tính sản phẩm
        var arr_id_style = await request.dataType.map(function(item) {
            return item.value
        })
        // Update loại sản phẩm được chọn
        if (arr_id_style.length > 0) {
            // Danh sách loại sản phẩm được chọn
            let data_tyle = await Styleproduct.find({ _id: { $in: arr_id_style } })
            for (i = 0; i < data_tyle.length; i++) {
                var arr_id_product_old = await data_tyle[i].arr_product_ids
                var arr_id_product_new = await [itempost._id]
                var arr_id_product_update = await arr_id_product_old.concat(arr_id_product_new.filter(function(item) {
                    return arr_id_product_old.indexOf(item) < 0
                }))
                data_tyle[i].arr_product_ids = await arr_id_product_update
                var datastyles = await Styleproduct.findByIdAndUpdate(data_tyle[i]._id, { $set: { arr_product_ids: arr_id_product_update } }, { new: true }, function(result){
                    return result
                })
            }
        }
        //res.send(data_tyle)
        // Update loại sản phẩm không được chọn
        let notArrIdStyle = await request.dataType.map(function(item) {
            return item.value
        })
        if (notArrIdStyle.length > 0) {
            let dataNotStyle = await Styleproduct.find({ _id: { $nin: notArrIdStyle } })
            for (j = 0; j < dataNotStyle.length; j++) {
                //Loại bỏ id sản phẩm khỏi mảng id sản phẩm chứa trong loại sản phẩm
                var index_id_product_in_style = await dataNotStyle[j].arr_product_ids.indexOf(itempost._id)
                var arr_id_product_update_not_types = await dataNotStyle[j].arr_product_ids
                var arr_id_product_update_not_style = await arr_id_product_update_not_types.splice(index_id_product_in_style, 1)
                if (index_id_product_in_style > -1) {
                    var data_not_style = await Styleproduct.findByIdAndUpdate(dataNotStyle[j]._id, { $set: { arr_product_ids: arr_id_product_update_not_types } }, { new: true })
                }
            }
        }
        // update id trong danh mục liên quan
        var arr_id_cat_relate = await request.limitCat.map(function(item, i) {
            return item.value
        })
        for (i = 0; i < arr_id_cat_relate.length; i++) {
            var itemcatrelate = await Catproduct.findOne({ _id: arr_id_cat_relate[i] })
            itemcatrelate.arr_id_product[itemcatrelate.arr_id_product.length] = await itempost._id
            var itemdatacatreldate = await Catproduct.findByIdAndUpdate(arr_id_cat_relate[i], { $set: { arr_id_product: itemcatrelate.arr_id_product } }, { new: true })
        }
        // Update danh mục sản phẩm không được chọn
        if (request.limitCat.length > 0) {
            let dataNotCatproduct = await Catproduct.find({ _id: { $nin: arr_id_cat_relate } })
            for (j = 0; j < dataNotCatproduct.length; j++) {
                //Loại bỏ id sản phẩm khỏi mảng id sản phẩm chứa trong loại sản phẩm
                var index_id_product_in_cat = await dataNotCatproduct[j].arr_id_product.indexOf(itempost._id)
                var arr_id_product_update_not_cats = await dataNotCatproduct[j].arr_id_product
                var arr_id_product_update_not_cat = await arr_id_product_update_not_cats.splice(index_id_product_in_cat, 1)
                if (index_id_product_in_cat > -1) {
                    var data_not_cat = await Catproduct.findByIdAndUpdate(dataNotCatproduct[j]._id, { $set: { arr_id_product: arr_id_product_update_not_cats } }, { new: true })
                }
            }
        }
        request.style_ids = await request.dataType.map(function(item) {
            return item.value
        })
        request.arr_style_ids = await request.dataType.map(function(item) {
            return item.value
        })

        // update slug
        let data_category = await Catproduct.findOne({ _id: req.body.category_id })
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
            arr_style_ids: arr_id_style,
            style_ids: arr_id_style,
            name: req.body.name,
            alias: slugify(req.body.name, {
                replacement: '-',    // replace spaces with replacement
                remove: null,        // regex to remove characters
                lower: true          // result in lower case
            }),
            slug: paths,
            description: req.body.description,
            detail: req.body.detail,
            price: req.body.price,
            price_old: req.body.price_old,
            price_sale: req.body.price_sale,
            category_id: req.body.category_id,
            imagePath: req.body.imagePath,
            imageArray: req.body.imageArray,
            imageNumber: req.body.imageNumber,
            limitCat: req.body.limitCat,
            count: req.body.count,
            option_product: arr_option_product,
            data_option_product: arr_option_product,
            long: req.body.long,
            height: req.body.height,
            width: req.body.width,
            weight: req.body.weight,
            title_seo: req.body.title_seo,
            description_seo: req.body.description_seo,
            keyword_seo: req.body.keyword_seo,
        }
        if(post_data_product.price_sale!=0){
            post_data_product.epay = Math.round(1.25*post_data_product.price_sale/4800 * 1000)/1000
            var p = (parseFloat(post_data_product.price)-parseFloat(post_data_product.price_sale))*100/post_data_product.price
            post_data_product.percent = Math.ceil(p)
        }else{
            post_data_product.percent = 0
            post_data_product.epay = Math.round(1.25*post_data_product.price/4800 * 1000)/1000
        }
        let data_product = await Product.findByIdAndUpdate(itempost._id, { $set: post_data_product }, { new: true })
        if(data_product){
            let data_alias = await {
                "name": data_product.name,
                "title": data_product.name,
                "alias": data_product.alias,
                "slug": paths,
                "path": paths,
                "name_table": "product",
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
        res.send({
            data_product: data_category,
            status: 1
        })
    }

}
productController.saveProductAndTagAsyncs = async function(req, res, next) {
    const request = req.body
    let returnres
    if (request._id) {
        const post = await Product.findById(request._id)
        //Thêm loại sản phẩm
        let datastyle
        for (i = 0; i < savedpost.arr_style_ids.length; i++) {
            let itemStyle = await Styleproduct.findOne({ _id: savedpost.arr_style_ids[i] })
            itemStyle.arr_product_ids[itemStyle.arr_product_ids.length] = await savedpost._id
            datastyle = await Styleproduct.findByIdAndUpdate(itemStyle._id, { $set: { arr_product_ids: itemStyle.arr_product_ids } }, { new: true })
        }
        returnres = await post.savePostTags(request)
    } else {
        const post = new Product()
        returnres = await post.savePostTags(request)
    }
    res.send(returnres)
}
productController.remove = function(req, res) {
    const request = req.body
    Product.findByIdAndRemove(request._id, (err, post) => {
        if (err) {
            res.send(err)
        } else {
            res.send({ post: post, message: 'deleted' })
        }
    })
}
//get data with url and link
productController.getDataUrl = function(req, res) {
    Product.aggregate([{
        "$project": {
            "id": "$_id",
            "value": "$slug",
            "label": "$name"
        }
    }]).exec((err, post) => {
        res.send(post)
    })
}
async function postdataparentid(data_category, id) {
    let ids = id
    let category_id = await data_category.parent_id
    let data_categorys = await Catproduct.findById(data_category.parent_id)
    if (data_categorys.parent_id != null) {
        return await postdataparentid(data_categorys, ids) + '/' + data_categorys.alias
    }
    return data_categorys.alias

}
productController.getOptionProduct = async function(req, res, next){
  const query = url.parse(req.url, true).query
  var price = 0
  var epay = 0
  if(query.arr_id_option_product && query.id_product){
    var itemProduct = await Product.findOne({_id: query.id_product})
    if(itemProduct.price_sale>0){
      price = itemProduct.price_sale
      epay = itemProduct.epay
    }else{
      price = itemProduct.price
      epay = itemProduct.epay
    }
    var arr_id_option_product = query.arr_id_option_product.split(',')
    if(arr_id_option_product.length>0){
      for(i=0;i<arr_id_option_product.length;i++){
        var itemOptionProduct = await Optionproduct.findOne({_id: arr_id_option_product[i]})
        if(itemOptionProduct){
          if(itemOptionProduct.price_prefix=="-"){
            price -= itemOptionProduct.price
          }else{
            price += itemOptionProduct.price
          }
        }
      }
    }
  }
  res.send({price: price, epay: Math.round(1.25*price/4800 * 1000)/1000, arr_id_option_product: arr_id_option_product})
}
module.exports = productController
