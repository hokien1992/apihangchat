
function showCaptcha(){
  var urlRoot = $('#urlRoot').val()
  $.ajax({
    url: '/captcha/viewcaptcha',
    data: {},
    type: "get",
    success: function(res){
      console.log(res)
      $('#captcha').html(res)
    }
  })
}
