(function() {

    var target_file

    

    function emptyFileUploader() {
        $('#upload_avatar_input').val('')
    }

    function eventBind() {
        $('.operate-wrapper button.btn-primary').click(function() {
            app.utility.showRightSideBar()
        })

        $('.operate-wrapper button.btn-danger').click(function() {
            deleteUser()
        })

        $('#fobid_user').click(function(event) {
            forbid_user($(this))
        })

        $('.button-close-pane').click(function() {
            app.utility.hideRightSideBar()
        })

        $('#upload_avatar_input').change(function(event) {
            readyToUpload(event)
        })

        $('#edit_user_btn').click(function(event) {
            if (app.utility.isValidForm('edit_user_form')) {
                if (needChangeAvatar()) {
                    satrtUpload(startEditUser)
                } else {
                    editUserIsWorking()
                    startEditUser()
                }
                event.preventDefault()
            }

            function startEditUser() {
                $.ajax({
                    type        : 'put',
                    url         : $('#edit_user_form').attr('action'),
                    data        : $('#edit_user_form').serialize(),
                    beforeSend  : function(xhr) {
                        editUserIsWorking()
                    },
                    success     : function(data) {
                        if (data.ok) {
                            location.href = location.href
                        }
                    }
                })
            }
        })
    }

    function forbid_user($btn) {
        $.ajax({
            type        : 'put',
            url         : '/users/' + $('#edit_user_form input[name="id"]').val() + '/active',
            data        : {active : $btn.data('active')}, 
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                location.href = location.href
            }
        })
    }

    function deleteUser() {
        var sure = confirm('确认删除？')
        if (sure) {
            $.ajax({
                type        : 'delete',
                url         : '/users/' + $('#edit_user_form input[name="id"]').val(),
                success     : function(data) {
                    if (data.ok) {
                        alert('删除成功')
                        location.href = '/users'
                    }
                }
            })
        }
    }

    function editUserIsWorking() {
        $('#edit_user_btn').html('提交中...').addClass('disabled').off()
    }

    function needChangeAvatar() {
        if ($('#upload_avatar_input').val()) {
            return true
        } else {
            return false
        }
    }

    function satrtUpload(cb) {
        if (!target_file) {
            alert('请选择图片')
            return
        }

        var file_form = new FormData()
        file_form.append($('#upload_avatar_input').attr('name'), target_file)
        editUserIsWorking()
        var ajaxMethod      = 'put'
        var avatarFilename  = '/' + $('.avatar-preview input').val().split('/')[$('.avatar-preview input').val().split('/').length - 1] 
        if (needCreateAvatar()) {
            ajaxMethod      = 'post'
            avatarFilename  = ''
        }
        $.ajax({
            type        : ajaxMethod,
            url         : '/upload-avatar' + avatarFilename,
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

    function needCreateAvatar() {
        var avatar = $('.avatar-preview input').val()
        if (avatar == '/images/blank-avatar.jpg') {
            return true
        } else {
            return false
        }
    }

    function changePsw($btn) {

        function startChangePsw() {
            $.ajax({
                type        : 'put',
                url         : $('#changePswForm').attr('action'),
                data        : $('#changePswForm').serialize(),
                beforeSend  : function() {
                    app.utility.isWorking($btn)
                },
                success     : function(data) {
                    if (data.ok) {
                        location.href = location.href
                    }
                }
            })
        }

        if (app.utility.isValidForm('changePswForm')) {
            startChangePsw()
            event.preventDefault()
        }
    }

    $(function() {
        app.utility.highlightCurrentPage('成员列表')

        eventBind()

        emptyFileUploader()

        app.viewhelper.markDifferentColorToBugStatus($('span.bug-status'))

        app.viewhelper.markDifferentColorToTaskStatus($('span.task-status'))

        $('#changePswBtn').click(function(event) {
            $('#changePswModal').modal()
        })

        $('#saveNewPswBtn').click(function(event) {
            changePsw($(this))
        })
    })
})()