(function() {
    var target_file
    $(function() {
        app.utility.highlightCurrentPage('任务')
        app.utility.highlightTaskNav('附件')
        app.viewhelper.setFileIcon()
        checkPaneNeedOpen()
        eventBind()
    })

    function eventBind() {

        //close pane btn
        $('.button-close-pane').click(function() {
            app.utility.hideRightSideBar()
        })

        //add task milestone btn
        $('#upload_task_files').click(function() {
            app.utility.showRightSideBar()
            resetUploadForm()
        })

        //submit task milestone btn
        $('#upload_task_files_form_btn').click(function(event) {
            readyToUpload.call(this, event, $(this))
        })

        //ready to upload
        $('#upload_status_files_input').change(function(event) {
            if (event.currentTarget.files) {
                target_file = event.currentTarget.files
            } else {
                target_file = null
            }
            
        })

    }

    function checkPaneNeedOpen() {
        if (app.utility.get_query_value('create') == 'true') {
            app.utility.showRightSideBar()
            resetUploadForm()
        }
    }

    function resetUploadForm() {
        $('#upload_status_files_input').val('')
    }

    function readyToUpload(event, $btn) {
        event.preventDefault() 
        if (needFiles()) {
            satrtUpload($btn, function() {
                 startAddStatus($btn)
            })
        } else {
            alert('请选择文件')
        }

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
            url         : $('#upload_task_files_form').attr('action'),
            processData : false,
            contentType : false,
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            data        : file_form,
            success     : function(data) {
                if (data.ok == 1) {
                    location.href = location.href.split('?')[0]
                } else {
                    alert('上传失败')
                }
            } 
        })
    }

})()