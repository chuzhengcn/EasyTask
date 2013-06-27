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

    function readyToAddBug(event, $btn) {
        if (app.utility.isValidForm('createBugForm')) {
            event.preventDefault() 
            if (needFiles()) {
                satrtUpload($btn, function() {
                    startAddBug($btn)
                })
            } else {
                startAddBug($btn)
            }
        }
    }

    function startAddBug($btn) {
        var sendToServerData =  {}
        editor.sync()
        $('#createBugForm').serializeArray().forEach(function(item, index, array) {
            sendToServerData[item.name] = item.value
        })
        sendToServerData.taskfiles = files_info
        $.ajax({
            type        : 'post',
            url         : $('#createBugForm').attr('action'),
            data        : sendToServerData,
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
        var file_attr = $('#upload_todo_files_input').attr('name')
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

    function eventBind() {

        //submit task bug btn
        $('#saveBug').click(function(event) {
            readyToAddBug.call(this, event, $(this))
        })

        //ready to upload
        $('#upload_todo_files_input').change(function(event) {
            if (event.currentTarget.files) {
                target_file = event.currentTarget.files
            } else {
                target_file = null
            }
            
        })

    }
    
    $(function() {
        app.utility.highlightCurrentPage('任务')
        app.utility.highlightTaskNav('Bug')
        eventBind()
        setEditor()
    })

})()