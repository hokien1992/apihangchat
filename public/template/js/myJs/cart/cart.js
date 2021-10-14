var tokens = $("#tokens_cart").val();
$(".tokens_update_cart").val(tokens);
if($('#oldCountry').val()){
    $("#countryCustomer").val($('#oldCountry').val());
}
function changeCountry(){
  var url = $('base').attr('href')
  var parent = $('#countryCustomer').val()
  if(parent!=''){
    $.ajax({
        type: "get",
        url: url+'/api/location/listProvince',
        data: {country: parent},
        success: function(data){
          console.log(data.province)
          var html = '<option value="0">Tỉnh/Thành</option>';
          $.each(data.province, function(i, item) {
              html+='<option value="'+item.id+'">'+item.province_name+'</option>';
          })
          $("#provinceCustomer").html(html)
          if($('#oldProvince').val()){
            $("#provinceCustomer").val($('#oldProvince').val())
          }
        }
    });
  }
}
function changeProvince(){
    var url = $('base').attr('href')
    var parent = $('#provinceCustomer').val()
    //alert(url)
    if(parent!=''){
      $.ajax({
        type: "get",
        url: url+'/api/location/listDistrict',
        data: {province: parent},
        success: function(data){
            console.log(data)
            var html = '<option value="0">Quận/Huyện</option>';
            $.each(data.district, function(i, item) {
              html+='<option value="'+item.id+'">'+item.name+'</option>';
            })
            $("#districtCustomer").html(html)
            if($('#oldDistrict').val()){
              $("#districtCustomer").val($('#oldDistric \\t').val())
            }
        }
      })
    }
}
function changeDistrict(){
    var url = $('base').attr('href')
    var parent = $('#districtCustomer').val()
    if(parent!=''){
      $.ajax({
        type: "get",
        url: url+'/api/location/listWards',
        data: {district: parent},
        success: function(data){
          var html = '<option value="">Xã/Phường</option>';
          $.each(data.wards, function(i, item) {
              html +='<option value="'+item.id+'">'+item.name+'</option>'
          })
          $("#wardsCustomer").html(html)
          $("#wardsCustomer").val($('#oldWards').val())
        }
      })
    }
}
function changeHinhthuc(key){
    console.log(key)
    $('.type_payment_content').hide();
    $('.type_payment_content'+key).show();
}
function checkShipAll(){
    var url = $('base').attr('href')
    var data = {

    }
    if(parent!=''){
        $.ajax({
            type: "get",
            url: url+'/checkShipAll',
            data: {

            },
            success: function(data){

            }
        })
    }
}
function modalDeleteAddress(id){
  $('#idAddress').val(id)
  $('#modalDeleteAddress').modal('show')
}

$('#postFormCart').submit(function(e){
  e.preventDefault();
  var url = $('base').attr('href');
  var formDataVar = $("#postFormCart").serialize();
  $.ajax({
      url: url + '/add-order',
      type:'POST',
      data: formDataVar
  }).done(function(res){
    console.log(res);
    var url = $('base').attr('href')
    if(res.success==1){
      window.location.href = url+res.url;
    }else{
      $('.error_checkout').html(res.message);
      $("#notifyCart").modal("show");
    }
  });
})
//check_option
$('.swatch-option').click(function(){
  //var id_option = $(this).attr('data-id');
  $(this).parent().find('.swatch-option').removeClass('check_option');
  $(this).toggleClass('check_option');
  //$(this).parent().parent().attr('data-id',id_option);
  var arr_id_option_product = '';
  $('.check_option').each(function(index){

    var dau = '';
    if(index!=0){
      dau = ',';
    }
    //console.log(this)
    var str = dau+this.getAttribute('data-id');
    //console.log(str);
    arr_id_option_product += str;
  })
  var id_product = $('#productId').val();
  console.log(arr_id_option_product);
  $.ajax({
      type: "get",
      url: '/api/product/getOptionProduct',
      data: {
        id_product:id_product,
        arr_id_option_product: arr_id_option_product
      },
      success: function(res){
        $('.product-info-price .price').html(formatNumber(res.price)+ '<sup>đ</sup>');
        $('.number_epay').html(res.epay+ ' epay');
      }
  })
})
$('#addToCart').click(function(){
  var url = $('base').attr('href');
  if($('.swatch-attribute').length>0){
    if($('.check_option')){
      if($('.swatch-attribute').length==$('.check_option').length){
        var productId = $('#productId').val();
        var qty = $('.input-qty').val();
        var arr_id_option_product = '';
        $('.check_option').each(function(index){
          var dau = '';
          if(index!=0){
            dau = ',';
          }
           arr_id_option_product += dau+this.getAttribute('data-id');
        })
        console.log(arr_id_option_product)
        console.log(productId)
        $.ajax({
            type: "get",
            url: '/addCart',
            data: {
              productId: productId,
              arr_id_option_product: arr_id_option_product,
              qty: qty
            },
            success: function(res){
              if(res.address==1){
                var url = $('base').attr('href');
                window.location.href = url+"/gio-hang";
              }else{
                $("#modalAddress").modal('show');
              }
            }
        })
      }else{
        alert('Bạn chưa chọn thuộc tính!');
      }
    }else{
      alert('Bạn chưa chọn thuộc tính!');
    }
  }else{
    var productId = $('#productId').val();
    var qty = $('.input-qty').val();
    var arr_id_option_product = '';
    $('.check_option').each(function(index){
      var dau = '';
      if(index!=0){
        dau = ',';
      }
       arr_id_option_product += dau+this.getAttribute('data-id');
    })
    $.ajax({
        type: "get",
        url: '/addCart',
        data: {
          productId: productId,
          arr_id_option_product: arr_id_option_product,
          qty: qty
        },
        success: function(res){
          if(res.address==1){
            var url = $('base').attr('href');
            window.location.href = url+"/gio-hang";
          }else{
            $("#modalAddress").modal('show');
          }
        }
    })
  }
})
function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

// $('.removeItemCart').click(function(){
//   alert(this.getAttribute('data-idoption'));
// })
