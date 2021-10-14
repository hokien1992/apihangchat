const express = require('express')
const app = express()
const fs = require('fs')
const Gallery = require("../../models/gallery")
const url = require('url')
//========Fix upload image
var multer = require('multer')
var cors = require('cors')
app.use(cors())
const galleryController = {}
//Danh sách image theo id
galleryController.listDataWithId = async (req, res) => {
  const query = await url.parse(req.url,true).query
  //res.send(query)
  const data = await Gallery.find({_id: {$in: query.dataId.split(',')} })
  res.send(data)
}
//Add record
galleryController.getAll = (req, res) => {
  Gallery.find().exec((err, post) => {
      res.send(post)
  })
}

galleryController.show = function(req, res) {
  const postId = req.params.id;
    Gallery.findById(postId).exec(function (err, admins) {
      res.send(admins)
    })
};

galleryController.store = (req, res) => {
  //res.send({result: req})
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public'+req.body.pathFolder)
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' +file.originalname )
    }
  })
  var upload = multer({ storage: storage }).single('file');
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
    } else if (err) {
        return res.status(500).json(err)
    }
    datas = {
      "title": '',
      "path": req.body.pathFolder+'/'+req.file.filename,
      "size": req.file.size,
      "filename": req.file.filename,
      "destination": req.file.destination,
      "idFolder": req.body.idFolder,
    }
    var newPost = new Gallery(datas);
        newPost.save(function(err, results){
            res.send(results)
        })
    })
}
galleryController.update = function(req, res) {
    var messenger = {}
    var data = {
        name: req.body.name,
        description: req.body.description,
    }
    Gallery.findOne({'_id': req.params.id}, function(err, result){
        if(result){
          Gallery.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
                res.send(results)
            })
        }else{
            res.json({"message": "Lỗi chưa thể cập nhật sản phẩm"})
        }
    })
}
galleryController.remove = function(req, res){

  Gallery.findByIdAndRemove(req.params.id, (err, post) => {
      if(err){
          res.send(err)
      }else{
        var path = './upload'+post.path
        fs.unlink(path, function (err) {
          res.send({success: "Bạn đã xoá thành công!"})
      })
      }
  })
}
module.exports = galleryController
