// $('.btn-cart').click(function(){
//   var uid = $(this).attr('data-uid');
//   var url = $('#urlRoot').val()+'/add-to-cart/'+uid;
//   console.log(url)
//   $.ajax({
//     url: url,
//     type: 'get',
//     data: {},
//     success: function(res){
//       console.log(res)
//       $('.counter-number').text(res.totalQty);
//       var html = '';
//       $.each(res.items,function(i, item){
//         html += '<li class="product-item">'
//         html += '<a class="product-item-photo" href="#" title="The Name Product">'
//         html += '<img class="product-image-photo" src="'+item.item.imagePath+'" alt="The Name Product">'
//         html += '</a>'
//         html += '<div class="product-item-details">'
//         html += '<strong class="product-item-name">'
//         html += '<a href="#" title="'+item.item.name+'">'+item.item.name+'</a></strong>'
//         html += '<div class="product-item-price">'
//         html += '<span class="price">'+item.item.price+'<sup>đ</sup></span>'
//         html += '</div>'
//         html += '<div class="product-item-qty">'
//         html += '<span class="label">Số lượng: </span ><span class="number">'+item.qty+'</span>'
//         html += '</div>'
//                 // <div class="product-item-actions">
//                 //     <a class="action delete" href="#" title="Remove item">
//                 //         <span>Xoá</span>
//                 //     </a>
//                 // </div>
//         html += '</div></li>'
//       })
//       $('.minicart-items').html(html)
//       $('body').append('<div class="alert alert-sm alert-success success_item_order">Thêm vào giỏ hàng thành công!</div>');
//       setTimeout(function(){
//         $('.success_item_order').hide(1000)
//       }, 2000);
//       setTimeout(function(){
//         $('.success_item_order').remove()
//       }, 4000);
//     }
//   })
//
// })
