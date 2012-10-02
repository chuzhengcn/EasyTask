(function() {

    $(function() {
        app.utility.highlightCurrentPage('成员')
        eventBind()
        emptyFileUploader()
    })

    function emptyFileUploader() {
        $('#upload_avatar_input').val('')
    }

    function eventBind() {
        $('.operate-wrapper button').click(function() {
            app.utility.showRightSideBar()
        })

        $('.button-close-pane').click(function() {
            app.utility.hideRightSideBar()
        })

        $('#create_user_btn').click(function(event) {
            createUser()
            event.preventDefault()
        })

        $('#upload_avatar_input').change(function(event) {
            uploadAvatar(event)
        })
    }

    function createUser() {
        if (form_is_valid('create_user_form')) {
            $.ajax({
                type        : 'post',
                url         : $('#create_user_form').attr('action'),
                data        : $('#create_user_form').serialize(),
                beforeSend  : function(xhr) {
                    createUserIsWorking()
                },
                success     : function(data) {
                    if (data.ok) {
                        location.href = location.href
                    }
                }
            })
        }
    }

    function form_is_valid(formId) {
        var valid = document.getElementById(formId).checkValidity()
        return valid
    }

    function createUserIsWorking() {
        $('#create_user_btn').html('提交中...').addClass('disable').off()
    }

    function uploadAvatar(event) {
        var target_file = event.currentTarget.files[0]

        readyToUpload()

        function readyToUpload() {
            if (app.utility.isImage(target_file.type)) {
                var localUrl = app.utility.createObjectURL(target_file)
                $('.avatar-preview img').attr('src', localUrl)
                $('#upload_avatar_btn').show().text('开始上传')
                bindSatrtAvatarToClick()
            } else {
                alert('只允许上传图片')
                $('#upload_avatar_input').val('')
            }
        }

        function bindSatrtAvatarToClick() {
            $('#upload_avatar_btn').on('click',function(event) {
                satrtUpload()
                event.preventDefault()
            })
        }

        function satrtUpload() {
            if (!target_file) {
                alert('请选择图片')
                return
            }

            var file_form = new FormData()
            file_form.append($('#upload_avatar_input').attr('name'), target_file)
            uploadAvatarIsWorking()
            $.ajax({
                type        : 'post',
                url         : '/upload-avatar',
                processData : false,
                contentType : false,
                data        : file_form,
                success     : function(data) {
                    if (data.ok == 1) {
                        $('.avatar-preview input').val(data.url)
                        uploadComplete()
                    } else {
                        alert('上传失败')
                    }
                } 
            })

        }

        function uploadAvatarIsWorking() {
            $('#upload_avatar_btn').text('上传中...').addClass('disable').off()
        }

        function uploadComplete() {
            $('#upload_avatar_btn').text('上传完成').removeClass('disable').delay(1000).fadeOut()
        }
    }  
})()