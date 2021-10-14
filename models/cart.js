module.exports = function Cart(oldCart) {
    this.height = oldCart.height || 0
    this.width = oldCart.width || 0
    this.long = oldCart.long || 0
    this.weight = oldCart.weight || 0
    this.items = oldCart.items || []
    this.totalQty = oldCart.totalQty || 0
    this.totalPrice = oldCart.totalPrice || 0
    this.tracking = oldCart.tracking || ''
    this.addCart = function(item, id, qty, tracking, strIdProduct, dataOptionProduct, priceOrder) {
      this.tracking = tracking
      if (this.items[strIdProduct]) {
        var storedItem = this.items[strIdProduct]
        this.totalQty -= parseInt(storedItem.qty)
        this.totalPrice -= parseInt(storedItem.price)
        this.height -= parseInt(storedItem.height)
        this.width -= parseInt(storedItem.width)
        this.long -= parseInt(storedItem.long)
        this.weight -= parseInt(storedItem.weight)
        if (!storedItem) {
            storedItem = this.items[strIdProduct] = {
              item: item,
              qty: 0,
              price: 0,
              priceQty: 0,
              dataOptionProduct: dataOptionProduct
            }
        }
        storedItem.qty = parseInt(qty)
        // if(storedItem.item.price_sale!=0){
        //   storedItem.price = storedItem.item.price_sale * parseInt(storedItem.qty)
        // }else{
        //   storedItem.price = storedItem.item.price * parseInt(storedItem.qty)
        // }
        storedItem.priceQty = parseInt(priceOrder)
        storedItem.price = parseInt(priceOrder) * parseInt(storedItem.qty)
        storedItem.height = storedItem.item.height * parseInt(storedItem.qty)
        storedItem.width = storedItem.item.width * parseInt(storedItem.qty)
        storedItem.long = storedItem.item.long * parseInt(storedItem.qty)
        storedItem.weight = storedItem.item.weight * parseInt(storedItem.qty)
        this.height += parseInt(storedItem.height)
        this.width += parseInt(storedItem.width)
        this.long += parseInt(storedItem.long)
        this.weight += parseInt(storedItem.weight)
        this.totalQty += parseInt(storedItem.qty)
        this.totalPrice += parseInt(storedItem.price)
      } else {
        var storedItem = this.items[strIdProduct]
        if (!storedItem) {
            storedItem = this.items[strIdProduct] = {
              item: item,
              qty: 0,
              price: 0,
              priceQty: 0,
              dataOptionProduct: dataOptionProduct
            }
        }
        storedItem.qty = parseInt(qty)

        // if(storedItem.item.price_sale!=0){
        //   storedItem.price = storedItem.item.price_sale * parseInt(storedItem.qty)
        // }else{
        //   storedItem.price = storedItem.item.price * parseInt(storedItem.qty)
        // }
        storedItem.priceQty = parseInt(priceOrder)
        storedItem.price = priceOrder * parseInt(storedItem.qty)
        storedItem.height = storedItem.item.height * parseInt(storedItem.qty)
        storedItem.width = storedItem.item.width * parseInt(storedItem.qty)
        storedItem.long = storedItem.item.long * parseInt(storedItem.qty)
        storedItem.weight = storedItem.item.weight * parseInt(storedItem.qty)
        this.height += parseInt(storedItem.height)
        this.width += parseInt(storedItem.width)
        this.long += parseInt(storedItem.long)
        this.weight += parseInt(storedItem.weight)
        this.totalQty += parseInt(storedItem.qty)
        this.totalPrice += parseInt(storedItem.price)
      }
    }
    this.add = function(item, id, qty, tracking, strIdProduct, dataOptionProduct, priceOrder) {
        var storedItem = this.items[strIdProduct]
        if (!storedItem) {
            storedItem = this.items[strIdProduct] = { item: item, qty: 0, price: 0 }
        }
        storedItem.qty++

        // if(storedItem.item.price_sale!=0){
        //   storedItem.price = parseInt(storedItem.item.price_sale) * parseInt(storedItem.qty)
        // }else{
        //   storedItem.price = parseInt(storedItem.item.price) * parseInt(storedItem.qty)
        // }
        storedItem.price = priceOrder * parseInt(storedItem.qty)
        storedItem.height = storedItem.item.height * parseInt(storedItem.qty)
        storedItem.width = storedItem.item.width * parseInt(storedItem.qty)
        storedItem.long = storedItem.item.long * parseInt(storedItem.qty)
        storedItem.weight = storedItem.item.weight * parseInt(storedItem.qty)
        this.height += parseInt(storedItem.height)
        this.width += parseInt(storedItem.width)
        this.long += parseInt(storedItem.long)
        this.weight += parseInt(storedItem.weight)
        this.totalQty++
        this.totalPrice += parseInt(storedItem.price)
        this.tracking = tracking
    }
    this.update = function(item, id, qty, tracking, strIdProduct, dataOptionProduct, priceOrder) {
        var storedItem = this.items[strIdProduct]
        this.height -= parseInt(storedItem.height)
        this.width -= parseInt(storedItem.width)
        this.long -= parseInt(storedItem.long)
        this.weight -= parseInt(storedItem.weight)
        this.totalQty -= parseInt(storedItem.qty)
        this.totalPrice -= parseInt(storedItem.price)
        if (!storedItem) {
            storedItem = this.items[strIdProduct] = {
              item: item,
              qty: 0,
              price: 0,
              priceQty: 0,
              dataOptionProduct: dataOptionProduct
             }
        }
        storedItem.qty = parseInt(qty)
        // if(storedItem.item.price_sale!=0){
        //   storedItem.price = parseInt(storedItem.item.price_sale) * parseInt(storedItem.qty)
        // }else{
        //   storedItem.price = parseInt(storedItem.item.price) * parseInt(storedItem.qty)
        // }
        storedItem.price = priceOrder * parseInt(storedItem.qty)
        storedItem.height = storedItem.item.height * parseInt(storedItem.qty)
        storedItem.width = storedItem.item.width * parseInt(storedItem.qty)
        storedItem.long = storedItem.item.long * parseInt(storedItem.qty)
        storedItem.weight = storedItem.item.weight * parseInt(storedItem.qty)
        this.height += parseInt(storedItem.height)
        this.width += parseInt(storedItem.width)
        this.long += parseInt(storedItem.long)
        this.weight += parseInt(storedItem.weight)
        this.totalQty += parseInt(qty)
        this.totalPrice += parseInt(storedItem.price)
    }
    this.removeItemCart = function(strIdProduct) {
      if(this.items[strIdProduct]){
        var storedItem = this.items[strIdProduct]
        this.height -= parseInt(storedItem.height)
        this.width -= parseInt(storedItem.width)
        this.long -= parseInt(storedItem.long)
        this.weight -= parseInt(storedItem.weight)
        this.totalQty -= parseInt(storedItem.qty)
        this.totalPrice -= parseInt(storedItem.price)
        //this.items.splice(strIdProduct,1)
        delete this.items[strIdProduct]
      }
    }
    this.generateArray = function() {
        var arr = []
        for (var _id in this.items) {
            arr.push(this.items[_id])
        }
        return arr
    }
}
