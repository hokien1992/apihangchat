var bcrypt = require('bcryptjs')
var Admin = require("../../models/admin")
var adminController = {}
adminController.list = function(req, res, next) {
  Admin.find({}).exec((err, results) => {
    res.json(results)
  })
}
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
// adminController.show = function(req, res) {
//   var useId = req.params.id;
//   Admin.find(useId, { password: 0 }).then((err, users) => {
//       if(err)
//           res.send(err)
//       else if(!users)
//           res.send(404)
//       else
//           res.send(users)
//       next()
//   });
// };
adminController.show = function(req, res) {
  const postId = req.params.id;
  Admin.findById(postId).populate('imageNumber').exec(function (err, admins) {
    res.send(admins);
  });
};
adminController.create = function(req, res) {
  res.send('View tạo tài khoản');
};
//Add record
adminController.store = function(req, res) {
  Admin.findOne({'email': req.body.email}, function(err, user){
      var newPost = new Admin();
      if(req.body.password){
          var hashedPassword = bcrypt.hashSync(req.body.password, 8);
          newPost.password = hashedPassword;
      }
      newPost.name = req.body.name
      newPost.email = req.body.email
      newPost.phone = req.body.phone
      newPost.facebook = req.body.facebook
      newPost.zalo = req.body.zalo
      newPost.arrayPermission = req.body.arrayPermission
      newPost.role_id = req.body.role_id
      newPost.imageNumber = req.body.imageNumber
      newPost.imagePath = req.body.imagePath
      newPost.description = req.body.description
      newPost.save(function(err, newPost){
        if(err){
          res.send(err)
        }else{
          res.send(newPost)
        }
      });
  })
};

adminController.update = function(req, res) {
  let data = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      facebook: req.body.facebook,
      zalo: req.body.zalo,
      role_id: req.body.role_id,
      arrayPermission: req.body.arrayPermission,
      description: req.body.description,
      imageNumber: req.body.imageNumber,
      imagePath: req.body.imagePath
  }
  Admin.findOne({'email': req.body.email}, function(err, result){
      if(result && result._id!=req.params.id){
          res.send({"error":0})
      }else{
          Admin.findByIdAndUpdate(req.params.id, { $set: data}, { new: true }, function (err, results) {
              res.send(results)
          })
      }
  })
}

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
adminController.remove = function(req, res){
  const request = req.body;
  Admin.findByIdAndRemove(request._id, (err, post) => {
      if(err){
          res.send(err);
      }else{
          res.send({post: post, message:'deleted'});
      }
  });
}
module.exports = adminController;
