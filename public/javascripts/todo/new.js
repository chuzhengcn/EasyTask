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
                editor = K.create('#new_todo_des', editorOption)
        })
    }

    function eventBind() {

        //submit task todo btn
        $('#create_task_todo_form_btn').click(function(event) {
            readyToAddTodo.call(this, event, $(this))
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

    function getTaskId() {
        return $('.list-header header').data('id')
    }

    function readyToAddTodo(event, $btn) {
        if (app.utility.isValidForm('create_task_todo_form')) {
            event.preventDefault() 
            if (needFiles()) {
                satrtUpload($btn, function() {
                     startAddTodos($btn)
                })
            } else {
                startAddTodos($btn)
            }
        }
    }

    function startAddTodos($btn) {
        var sendToServerData =  {}
        editor.sync()
        $('#create_task_todo_form').serializeArray().forEach(function(item, index, array) {
            sendToServerData[item.name] = item.value
        })
        sendToServerData.taskfiles = files_info
        $.ajax({
            type        : 'post',
            url         : $('#create_task_todo_form').attr('action'),
            data        : sendToServerData,
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }

                location.href = '/tasks/' + getTaskCustomId() + '/todos/' + data.todo._id
            }
        })
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

    function getTaskCustomId() {
        return $('.list-header header').data('custom-id')
    }
    
    $(function() {
        app.utility.highlightCurrentPage('任务')
        eventBind()
        setEditor()
    })
})()