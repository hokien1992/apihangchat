var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Tag = require('./tag');
const Gallery = require('./gallery');
const Styleproduct = require('./styleproduct');
//var User = require('./user');
var productSchema = new Schema({
    name: { type: String, default: null },
    alias: { type: String, default: null },
    slug: { type: String, default: null },
    style_ids: { type: Array },
    limitCat: { type: Array },
    long: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    code: { type: String },
    count: { type: Number, default: 0 },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CatProduct'
    },
    arr_style_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Styleproduct',
      }
    ],
    supplier_id: { type: String, default: null },
    left: { type: Number },
    right: { type: Number },
    price: { type: Number },
    price_old: { type: Number },
    price_sale: { type: Number },
    epay: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
    price_commission: { type: Number, default: 0 },
    description: { type: String, default: null },
    detail: { type: String, default: null },
    imageNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gallery'
    },
    imagePath: { type: String, default: null },
    imageArray: { type: Array },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    comments: [
        {
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Admin',
            },
            text: String
        }
    ],
    tags:[
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag'
          }
        ],
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    arr_option_products:[
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Option_product'
          }
        ],
    option_product: { type: Array },
    title_seo: { type: String, default: null },
    description_seo: { type: String, default: null },
    keyword_seo: { type: String, default: null },
    tracking: { type: String, default: null },

})
// this is a kind of adding custom method to model
productSchema.methods.savePostTags = async function(request){
    // first save tag
    const tags = request.tags.map(function(item, index){
        return { label : item };  // this is loop and prepare tags array to save,
    })
    let savedtags
    try{
        savedtags = await Tag.insertMany(tags, {ordered:false}); // ordered falsee means however if we got error in one object, it will not stop and continue save to another objects like this
    }catch(err){
        if(err.code == "11000"){
            savedtags = await Tag.find({ "label" : {"$in": request.tags}});
        }else{
            return err;
        }
    }

    // second save post
    let savedpost
    try{
        this.set(request);
        this.tags = savedtags.map(function(item, index){
            return item._id
        })
        savedpost = await this.save();
    }catch(err){
        return err;
    }
    return {post:savedpost, tags:savedtags};
}

    productSchema.methods.comment = function(c){
        this.comments.push(c);
        return this.save();
    }
module.exports = mongoose.model('Product', productSchema);
