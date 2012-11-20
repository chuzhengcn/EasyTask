(function() {
    var target_file
    var files_info = []
    var editor
    
    $(function() {
        // app.utility.highlightCurrentPage('任务')
        app.utility.highlightTaskNav('文档')
        app.viewhelper.setSelect('task_todo_category_selecter')
        eventBind()
        setEditor()
    })

    function setEditor() {
        var editorOption = { 
            uploadJson : '/tasks/'+ getTaskId() +'/upload-files',
            items      : ['source', 'justifyleft', 'justifycenter', 'justifyright', 'fontsize', 'forecolor', 'bold', 'underline', 'image', 'link', 'unlink']
        }
        KindEditor.ready(function(K) {
                editor = K.create('#edit_todo_des', editorOption)
        })
    }

    function eventBind() {

        //submit task todo btn
        $('#edit_task_todo_form_btn').click(function(event) {
            readyToEditTodo.call(this, event, $(this))
        })

        //ready to upload
        $('#upload_todo_files_input').change(function(event) {
            if (event.currentTarget.files) {
                target_file = event.currentTarget.files
            } else {
                target_file = null
            }
            
        })

        $('#edit_task_todo_form .icon-remove').click(function(event) {
            removeTodoFile.call(this, event)
        })

    }
    
    function getTaskId() {
        return $('.list-header header').data('id')
    }

    function readyToEditTodo(event, $btn) {
        if (app.utility.isValidForm('edit_task_todo_form')) {
            event.preventDefault() 
            if (needFiles()) {
                satrtUpload($btn, function() {
                     startEditTodos($btn)
                })
            } else {
                startEditTodos($btn)
            }
        }
    }

    function startEditTodos($btn) {
        var sendToServerData =  {}
        editor.sync()
        $('#edit_task_todo_form').serializeArray().forEach(function(item, index, array) {
            sendToServerData[item.name] = item.value
        })
        sendToServerData.taskfiles = files_info
        $.ajax({
            type        : 'put',
            url         : $('#edit_task_todo_form').attr('action'),
            data        : sendToServerData,
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = '/tasks/' + getTaskId() + '/todos/' + getTodoId()
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

    function removeTodoFile(event) {
        var sure = confirm('确认删除？')
        if (!sure) {
            return
        }
        var $file_wrapper = $(this).parent()
        $.ajax({
            type        : 'put',
            url         : '/tasks/' + getTaskId() + '/todo/' + getTodoId() + '/files',
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

    function getTodoId() {
        return $('#edit_task_todo_form').data('id')
    }

})()