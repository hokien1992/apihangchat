var express = require('express');
var bcrypt = require('bcryptjs');
var Admin = require("../../models/admin");
const { check, validationResult } = require('express-validator/check');
var adminController = {};
var router = express.Router();
adminController.index = function(req, res, next) {
  Admin.find().populate('imageNumber').exec((err, results) => {
    res.render('backend/admin/index', { results: results, layout: 'layouts/backend/home', user: req.user});
  });
};
adminController.getAll = function(req, res, next) {
  Admin.find({}, { password: 0 }).then((err, users) => {
      if(err)
          res.send(err)
      else if(!users)
          res.send(404)
      else
          res.send(users)
      next()
  });
};

adminController.create = function(req, res) {
  const results = {};
  res.render('backend/admin/create', { results: results, csrfToken: req.csrfToken(), layout: 'layouts/backend/home', user: req.user});
};
adminController.show = function(req, res) {
  var postId = req.params.id;
  Admin.findOne({_id: req.params.id}).populate('imageNumber').exec(function (err, results) {
    if (err) {
      res.redirect("/admin/show/"+res._id);
    }
    else {
      res.render('backend/admin/show', { results: results, csrfToken: 'ghg', layout: 'layouts/backend/home', user: req.user});
    }
  });
};
//Add record
adminController.store = function(req, res) {
  Admin.findOne({'email': req.body.email}, function(err, user){
      var newPost = new Admin();
      if(req.body.password){
          var hashedPassword = bcrypt.hashSync(req.body.password, 8);	
          newPost.password = hashedPassword;			
      }
      newPost.name = req.body.name;
      newPost.email = req.body.email;
      newPost.imageNumber = req.body.imageNumber;
      newPost.imagePath = req.body.imagePath;
      newPost.zalo = req.body.zalo;
      newPost.facebook = req.body.facebook;
      newPost.gplus = req.body.gplus;
      newPost.phone = req.body.phone;
      newPost.website = req.body.website;
      newPost.address = req.body.address;
      newPost.save(function(err, newPost){
        res.redirect('/backend/admin/show/'+newPost._id);
      });
  });
};
adminController.edit = function(req, res) {
  Admin.findOne({_id: req.params.id}).exec(function (err, results) {
    if (err) {
      res.send(err);
    }
    else {
      res.send(results);
    }
  });
};

adminController.update = function(req, res) {
  
  var messenger = {};
  var data = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      imageNumber: req.body.imageNumber,
      zalo: req.body.zalo,
      website: req.body.website,
      facebook: req.body.facebook,
      gplus: req.body.gplus,
      address: req.body.address,
  }
  Admin.findOne({'email': req.body.email}, function(err, result){
      if(result && result._id!=req.params.id){
          res.send({"error":0});
      }else{
          Admin.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
              res.redirect('/backend/admin/show/'+req.params.id);
          });
      }
  });
};

adminController.delete = function(req, res) {
  Admin.remove({_id: req.params.id}, function(err) {
    if(err) {
      res.send(err);
    }
    else {
      res.send({"status":1});
    }
  });
};
module.exports = adminController;