(function() {
    var target_file
    var files_info = []
    var editor

    function setEditor() {
        var editorOption = { 
            uploadJson : '/tasks/'+ getTaskId() +'/upload-files',
            items      : ['source', 'justifyleft', 'justifycenter', 'justifyright', 'fontsize', 'forecolor', 'bold', 'underline', 'image', 'link', 'unlink']
        }
        KindEditor.ready(function(K) {
                editor = K.create('#bugContent', editorOption)
        })
    }

    function readyToEditBug(event, $btn) {
        if (app.utility.isValidForm('editBugForm')) {
            event.preventDefault() 
            if (needFiles()) {
                satrtUpload($btn, function() {
                    startEditBug($btn)
                })
            } else {
                startEditBug($btn)
            }
        }
    }

    function startEditBug($btn) {
        var sendToServerData =  {}
        editor.sync()
        $('#editBugForm').serializeArray().forEach(function(item, index, array) {
            sendToServerData[item.name] = item.value
        })
        sendToServerData.taskfiles = files_info
        $.ajax({
            type        : 'put',
            url         : $('#editBugForm').attr('action'),
            data        : sendToServerData,
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = '/tasks/' + getTaskCustomId() + '/bugs/' + getBugId()
            }
        })
    }

    function getTaskId() {
        return $('.list-header header').data('id')
    }

    function getTaskCustomId() {
        return $('.list-header header').data('custom-id')
    }

    function needFiles() {
        if (target_file) {
            return true
        } else {
            return false
        }
    }

    function satrtUpload($btn, cb) {
        var file_form = new FormData()
        var file_attr = $('#uploadBugFilesInput').attr('name')
        for (var i = 0; i < target_file.length; i++) {
            file_form.append(file_attr, target_file[i])
        }
        $.ajax({
            type        : 'post',
            url         : '/tasks/' + getTaskId() + '/upload-files',
            processData : false,
            contentType : false,
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            data        : file_form,
            success     : function(data) {
                if (data.ok == 1) {
                    files_info = data.files
                    cb()
                } else {
                    alert('上传失败')
                }
            } 
        })
    }

    function removeBugFile(event) {
        var sure = confirm('确认删除？')
        if (!sure) {
            return
        }
        var $file_wrapper = $(this).parent()
        $.ajax({
            type        : 'delete',
            url         : '/tasks/' + getTaskId() + '/bugs/' + getBugId() + '/file-delete',
            data        : { file_id : $(this).data('id') },
            beforeSend  : function() {
                $file_wrapper.html('正在删除...')
            },
            success     : function(data) {
                if (data.ok == 1) {
                    $file_wrapper.html('已删除')
                } else {
                    alert('删除失败，刷新页面后重试')
                }
            } 
        })
    }

    function getBugId() {
        return $('#editBugForm').data('id')
    }

    function deleteBug(event, $btn) {
        var sure = confirm('确认删除？')
        if (!sure) {
            return
        }

        $.ajax({
            type        : 'delete',
            url         : '/tasks/' + getTaskId() + '/bugs/' + getBugId(),
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }

                location.href = '/tasks/' + getTaskCustomId()
            }
        })
    }

    function eventBind() {

        //submit task bug btn
        $('#saveBugBtn').click(function(event) {
            readyToEditBug.call(this, event, $(this))
        })

        //ready to upload
        $('#uploadBugFilesInput').change(function(event) {
            if (event.currentTarget.files) {
                target_file = event.currentTarget.files
            } else {
                target_file = null
            }
            
        })

        $('.origin-file-item .icon-remove').click(function(event) {
            removeBugFile.call(this, event)
        })

        // remove bug
        $('#removeBugBtn').click(function(event) {
            deleteBug.call(this, event, $(this))
        })

    }
    
    $(function() {
        app.utility.highlightCurrentPage('任务')

        app.viewhelper.setSelect('bugLevel')

        app.viewhelper.setSelect('bugTypeSelector')

        app.viewhelper.setSelect('programmerSelector')

        eventBind()

        setEditor()
    })
})()