(function() {
    var target_file
    var files_info = []
    $(function() {
        // app.utility.highlightCurrentPage('任务')
        app.utility.highlightTaskNav('版本管理')
        setOriginTaskStatus()
        checkPaneNeedOpen()
        eventBind()
    })

    function eventBind() {

        //close pane btn
        $('.button-close-pane').click(function() {
            app.utility.hideRightSideBar()
        })

        //add task milestone btn
        $('#mark_task_status').click(function() {
            app.utility.showRightSideBar()
            resetStatusForm()
        })

        //submit task milestone btn
        $('#mark_task_status_form_btn').click(function(event) {
            readyToAddStatus.call(this, event, $(this))
        })

        //ready to upload
        $('#upload_status_files_input').change(function(event) {
            if (event.currentTarget.files) {
                target_file = event.currentTarget.files
            } else {
                target_file = null
            }
            
        })

        $('.delete-this-status').click(function() {
            delete_status.call(this)
        })

    }

    function setOriginTaskStatus() {
        app.viewhelper.setSelect('task_status_selecter')
    }

    function checkPaneNeedOpen() {
        if (app.utility.get_query_value('change') == 'true') {
            app.utility.showRightSideBar()
            resetStatusForm()
        }
    }

    function resetStatusForm() {
        $('#upload_status_files_input').val('')
        $('#mark_task_status_form textarea').val('')
    } 
    
    function getTaskId() {
        return $('.list-header header').data('id')
    }

    function readyToAddStatus(event, $btn) {
        if (app.utility.isValidForm('mark_task_status_form')) {
            event.preventDefault() 
            if (needFiles()) {
                satrtUpload($btn, function() {
                     startAddStatus($btn)
                })
            } else {
                startAddStatus($btn)
            }
        }
    }

    function startAddStatus($btn) {
        var sendToServerData =  {}
        $('#mark_task_status_form').serializeArray().forEach(function(item, index, array) {
            sendToServerData[item.name] = item.value
        })
        sendToServerData.taskfiles = files_info
        $.ajax({
            type        : 'post',
            url         : $('#mark_task_status_form').attr('action'),
            data        : sendToServerData,
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = location.href.split('?')[0]
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
        var file_attr = $('#upload_status_files_input').attr('name')
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
                    // $('#upload_status_files_input').remove()
                    cb()
                } else {
                    alert('上传失败')
                }
            } 
        })
    }

    function delete_status() {
        var statusId            = $(this).data('id')
        var currentDeleteBtn    = $(this)
        $.ajax({
            type        : 'delete',
            url         : '/tasks/' + getTaskId() + '/status/' + statusId,
            beforeSend  : function() {
                currentDeleteBtn.html('<span class="text-error">正在删除...</span>')
            },
            success     : function(data) {
                if (data.ok == 1) {
                    currentDeleteBtn.html('<span class="text-success">正在删除...</span>')
                    location.href= location.href
                } else {
                    alert('删除失败')
                }
            } 
        })
    }

})()