var Product = require('../models/product');
var mongoose = require('mongoose');
var uri = 'mongodb://shop2019:shop2019@cluster0-shard-00-00-uwpjt.mongodb.net:27017,cluster0-shard-00-01-uwpjt.mongodb.net:27017,cluster0-shard-00-02-uwpjt.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
mongoose.connect(uri, { useNewUrlParser: true });
var products = [
    new Product({
        imagePath: 'http://kute-themes.com/html/kuteshop/html/images/media/index2/deals1.jpg',
        name: 'Sản phẩm giày 1',
        description: 'Mô tả sản phẩm giày 1',
        price: 10,
    })
];
var done = 0;
for ( i = 0; i < products.length; i++) {
    products[i].save(function(err, result){
        done++;
        if(done === products.length){
            exit();
        }
    });
}
function exit(){
    mongoose.disconnect();
}