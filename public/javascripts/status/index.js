(function() {
    var statusTargetFile        = null,
        statusFilesInfo         = [],
        statusContetTemplate    = {
            developer : function() {
                return '【版本说明】：' + $('.list-header header a').text() + 
                '\n\n【脚本说明】：\n\n【关联站点】：' + 
                $('.task-info .sites').text() + 
                '\n\n【关联数据库】： \n\n【更新步骤】： \n\n【是否重启】： \n\n【测试地址】： \n\n【特殊情况说明】：\n\n'
            } 
        };

    function setChangeStatusBtnGroup() {
        var role        = '',
            btnGroup    = [];

        function insertStatusBtn(name) {
            if (btnGroup.indexOf(name) > -1) {
                return
            }

            btnGroup.push(name)
        }

        $.ajax({
            url     : '/userinfo',
            success : function(data) {
                if (!data.ok) {
                    return
                }

                role = data.result.role

                if (role.indexOf('PM') > -1) {
                    insertStatusBtn('需求提交')
                    insertStatusBtn('任务已分配')
                    insertStatusBtn('已提交Master')
                    insertStatusBtn('已提交Test')
                    insertStatusBtn('已提交Dev')
                    insertStatusBtn('已发布外网')
                    insertStatusBtn('已验收通过')
                    insertStatusBtn('已提交Release')
                }

                if (role.indexOf('Programmer') > -1) {
                    insertStatusBtn('开发已完成')
                }

                if (role.indexOf('Tester') > -1) {
                    insertStatusBtn('Release测试通过')
                    insertStatusBtn('Master测试通过')
                    insertStatusBtn('Test测试通过')
                    insertStatusBtn('Dev测试通过')
                    insertStatusBtn('测试拒绝')
                }

                btnGroup.forEach(function(item, index) {
                    $('.change-status-btn-group .btn-group .dropdown-menu').append('<li><a href="#"><span class="label">' + item + '</span></a></li>')
                })

                $('.change-status-btn-group .btn-group .dropdown-menu a').click(function(event) {
                    showStatusForm($(this).text())
                    event.preventDefault()
                })

                app.viewhelper.markDifferentColorToTaskStatus($('.change-status-btn-group .btn-group .dropdown-menu span.label'))
            }
        })
    }

    function showStatusForm(statusName) {
        var $textarea = $('#createStatusForm textarea')

        if (statusName.indexOf('开发') > -1) {
            $textarea.val(statusContetTemplate.developer())
        }

        $('#createStatusForm input[name="name"]').val(statusName)
        $('#createStatusModal h3').html(statusName)
        $('#createStatusModal').modal()
    }

    function readyToAddStatus(event, $btn) {
        if (app.utility.isValidForm('createStatusForm')) {
            event.preventDefault() 
            if (needStatusFiles()) {
                satrtUploadStatusFile($btn, function() {
                    startAddStatus($btn)
                })
            } else {
                startAddStatus($btn)
            }
        }
    }

    function needStatusFiles() {
        if (statusTargetFile) {
            return true
        } else {
            return false
        }
    }

    function startAddStatus($btn) {
        var sendToServerData =  {}
        $('#createStatusForm').serializeArray().forEach(function(item, index, array) {
            sendToServerData[item.name] = item.value
        })
        sendToServerData.taskfiles = statusFilesInfo
        $.ajax({
            type        : 'post',
            url         : $('#createStatusForm').attr('action'),
            data        : sendToServerData,
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = location.href
            }
        })
    }

    function satrtUploadStatusFile($btn, cb) {
        var file_form = new FormData()
        var file_attr = $('#uploadStatusFilesInput').attr('name')
        for (var i = 0; i < statusTargetFile.length; i++) {
            file_form.append(file_attr, statusTargetFile[i])
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
                    statusFilesInfo = data.files
                    // $('#upload_status_files_input').remove()
                    cb()
                } else {
                    alert('上传失败')
                }
            } 
        })
    }

    

    function eventBind() {
        $('.delete-this-status').click(function() {
            deleteStatus.call(this)
        })

        //save status
        $('#saveStatusBtn').click(function(event) {
            readyToAddStatus.call(this, event, $(this))
            event.preventDefault()
        })

        //upload status files
        $('#uploadStatusFilesInput').change(function(event) {
            if (event.currentTarget.files) {
                statusTargetFile = event.currentTarget.files
            } else {
                statusTargetFile = null
            }
        })
    }


    function deleteStatus() {
        var sureToDelete = confirm('确认删除？')
        if(!sureToDelete) {
            return
        }

        var statusId            = $(this).data('id')
        var currentDeleteBtn    = $(this)
        $.ajax({
            type        : 'delete',
            url         : '/tasks/' + getTaskId() + '/status/' + statusId,
            beforeSend  : function() {
                currentDeleteBtn.html('<span class="text-error">删除中</span>')
            },
            success     : function(data) {
                if (data.ok == 1) {
                    currentDeleteBtn.html('<span class="text-success">已删除</span>')
                } else {
                    alert(data.msg)
                }
                location.href= location.href
            } 
        })
    }

    function getTaskId() {
        return $('.list-header header').data('id')
    }

    $(function() {
        eventBind()
        app.utility.highlightCurrentPage('任务')
        setChangeStatusBtnGroup()
        app.viewhelper.markDifferentColorToTaskStatus($('.status-name span.label'))
    })

})()