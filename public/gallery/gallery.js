function showModalGallery(colum,num){
    $('#checksIG').val(num);
    $('#columsIG').val(colum);
    showGalley('');
    $('#modal-gallery').modal('show');
}
//Hàm hiển thị ảnh và active ảnh khi ảnh dược chọn
function showGalley(str){
    $.ajax({
        url: '/backend/gallery/lists',
        data: {},
        type:'get',
        success: function(res){
            var html = '';
            var dem = 0;
            var strIDGallery = '';
            var strPATHGallery = '';
            var dau = '';
            var demDau = 0;
            $.each( res, function( key, val ) {
                if(str==''){
                    if(key==0){
                        demDau++;
                        if(demDau>1){
                            dau = ',';
                        }
                        strIDGallery += dau+val._id;
                        strPATHGallery += dau+val.path;
                        html += '<div class="col-sm-3 col_item_gallery active_gallery" data-path="'+val.path+'" data-id="'+val._id+'" onclick=col_item_gallery(this)>';
                    }else{
                        html += '<div class="col-sm-3 col_item_gallery" data-path="'+val.path+'" data-id="'+val._id+'" onclick=col_item_gallery(this)>';
                    }
                }else{
                    if(str==val._id){
                        if(demDau>1){
                            dau = ',';
                        }
                        demDau++;
                        strIDGallery += dau+val._id;
                        strPATHGallery += dau+val.path;
                        html += '<div class="col-sm-3 col_item_gallery active_gallery" data-path="'+val.path+'" data-id="'+val._id+'" onclick=col_item_gallery(this)>';
                    }else{
                        html += '<div class="col-sm-3 col_item_gallery" data-path="'+val.path+'" data-id="'+val._id+'" onclick=col_item_gallery(this)>';
                    }
                }   
                html += '<div class="box_out_item_gallery">';
                html += '<div class="box_in_item_gallery">';
                html += '<img src="'+val.path+'" alt="">';
                html += '</div>';
                html += '</div>';
                html += '</div>';
                dem++;
            });
            $('#list_galley').html(html);
            $('#strIDGallery').val(strIDGallery);
            $('#strPATHGallery').val(strPATHGallery);
        }
    })
}
$('#file_gallery').change(function(){
    //$('#uploadGallery').submit(function() {
        $('#uploadGallery').ajaxSubmit({
            success: function(response) {
                //console.log(response);
                showGalley();
            }
        });
        return false;
    //});
});
//Chọn ảnh hiển thị
function col_item_gallery(event){
    //console.log(event.getAttribute('data-id'));
    //alert(event.getAttibute('data-id'));
    if($('checks').val()==0){
        $('.col_item_gallery.active_gallery').removeClass('active_gallery');
    }
    showGalley(event.getAttribute('data-id'));
}
function selectImage(){
    var nameIdColum = $('#columsIG').val();
    var strPATHGallery = $('#strPATHGallery').val();
    var strIDGallery = $('#strIDGallery').val();
    var html = '';
    //html += '<a class="btn btn-sm btn-danger">Xóa</a>';
    html += '<div class="in_showImageUpload">';
    html += '<div class="divShowImageUpload imageNumber">';
    html += '<img src="'+strPATHGallery+'" alt="">';
    html += '</div>';
    html += '</div>';
    $('.show_'+nameIdColum).html(html);
    $('#'+nameIdColum).val(strIDGallery);
};