(function() {
    var target_file

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
            if (form_is_valid('create_user_form')) {
                if (needAvatar()) {
                    satrtUpload(startCreateUser)
                } else {
                    setDefaultAvatar()
                    createUserIsWorking()
                    startCreateUser()
                }
                event.preventDefault() 
            }
        })

        $('#upload_avatar_input').change(function(event) {
            readyToUpload(event)
        })
    }

    function startCreateUser() {
        $.ajax({
            type        : 'post',
            url         : $('#create_user_form').attr('action'),
            data        : $('#create_user_form').serialize(),
            success     : function(data) {
                if (data.ok) {
                    location.href = location.href
                }
            }
        })
    }

    function form_is_valid(formId) {
        var valid = document.getElementById(formId).checkValidity()
        return valid
    }

    function createUserIsWorking() {
        $('#create_user_btn').html('提交中...').addClass('disable').off()
    }

    function needAvatar() {
        if ($('#upload_avatar_input').val()) {
            return true
        } else {
            return false
        }
    }

    function readyToUpload(event) {
        target_file = event.currentTarget.files[0]

        if (app.utility.isImage(target_file.type)) {
            var localUrl = app.utility.createObjectURL(target_file)
            $('.avatar-preview img').attr('src', localUrl)
        } else {
            alert('只允许上传图片')
            $('#upload_avatar_input').val('')
        }
    }


    function satrtUpload(cb) {
        if (!target_file) {
            alert('请选择图片')
            return
        }

        var file_form = new FormData()
        file_form.append($('#upload_avatar_input').attr('name'), target_file)
        createUserIsWorking()
        $.ajax({
            type        : 'post',
            url         : '/upload-avatar',
            processData : false,
            contentType : false,
            data        : file_form,
            success     : function(data) {
                if (data.ok == 1) {
                    $('.avatar-preview input').val(data.url)
                    cb()
                } else {
                    alert('上传失败')
                }
            } 
        })
    }

    function setDefaultAvatar() {
        $('.avatar-preview input').val($('.avatar-preview img').attr('src'))
    }
})()