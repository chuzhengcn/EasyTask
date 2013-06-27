(function() {
    var statusTargetFile,
        statusFilesInfo = [];

    function typeaheadUser() {
        var users = [];

        $('#taskUsersOption option').each(function() {
            users.push($(this).val())
        })

        $('input[name="taskUsers"]').typeahead({
            source : users
        })
    }

    function typeaheadProject() {
        var projects = [];

        $('#projectOption option').each(function() {
            projects.push($(this).val())
        })

        $('input[name="project"]').typeahead({
            source : projects
        })
    }

    function addMoreTaskUserInput() {
        $('input[name="taskUsers"]:first').clone().insertBefore($('#addMoreTaskUserBtn')).val('').focus()
        typeaheadUser()
    }

    function addMoreProjectInput() {
        $('input[name="project"]:first').clone().insertBefore($('#addMoreProjectBtn')).val('').focus()
        typeaheadProject()
    }

    function hasUnknowUser() {
        var userOptionArray = [], 
            has             = false;

        $('#taskUsersOption option').each(function() {
            userOptionArray.push($(this).val())
        })

        $('input[name="taskUsers"]').each(function() {
            var userName = $(this).val()
            if (userName !== '') {
                if (userOptionArray.indexOf(userName) == -1) {
                    alert('未知参与者\n\n' + userName + '\n\n不能包含该人员')
                    has = true
                }
            }
        })

        return has
    }

    function hasUnknowProject() {
        var projectOptionArray = [],
            has                = false;

        $('#projectOption option').each(function() {
            projectOptionArray.push($(this).val())
        })

        $('input[name="project"]').each(function() {
            var projectName = $(this).val()
            if (projectName !== '') {
                if (projectOptionArray.indexOf(projectName) == -1) {
                    alert('未知站点\n\n' + projectName + '\n\n不能包含该站点')
                    has = true
                }
            }
        })

        return has
    }

    function readyToEditTask(event) {
        if (app.utility.isValidForm('editTaskForm')) {
            if (!hasUnknowUser() && !hasUnknowProject()) {
                editTaskIsWorking()
                satrtEditTask()
            } 
        }

        event.preventDefault() 
    }

    function editTaskIsWorking() {
        $('#saveTask').html('提交中...').addClass('disabled').off()
    }

    function satrtEditTask() {
        $.ajax({
            type        : 'put',
            url         : $('#editTaskForm').attr('action'),
            data        : $('#editTaskForm').serialize(),
            success     : function(data) {
                if (data.ok) {
                    location.href = '/tasks/' + data.task.custom_id
                } else {
                    editTaskIsComplete()
                    alert(data.msg)
                }
            }
        })
    }

    function editTaskIsComplete() {
        $('#saveTask').html('提交').removeClass('disabled').on('click', function(event) {
            var self = this
            readyToEditTask.call(self, event)
        })
    }

    function getNewCustomId() {
        $('#getNewCustomId').html('正在获取')
        $.ajax({
            type        : 'put',
            url         : '/get-new-custom-id',
            success     : function(data) {
                if (data.ok == 1) {
                    $('#editTaskForm input[name="branch"]').hide().fadeIn()
                    var originBranch = $('#editTaskForm input[name="branch"]').val()
                    var newBranch
                    if (originBranch.indexOf('/') > -1 && originBranch.indexOf('-') > -1) {
                        var developer = originBranch.substring(originBranch.indexOf('-'), originBranch.indexOf('/'))
                        newBranch = "master" + developer + "/" + data.id 
                    } else {
                        newBranch = "master-developer/" + data.id
                    }
                    $('#editTaskForm input[name="branch"]').val(newBranch)

                    $('#getNewCustomId').html('再次获取')
                } else {
                    alert('获取出错，请重试')
                    $('#getNewCustomId').html('再次获取')
                }
            }
        })
    }

    function getTaskId() {
        return $('.list-header header').data('id')
    }

    function deleteTask($btn) {
        var sure = confirm('确认删除？')
        if (sure) {
            $.ajax({
                type        : 'delete',
                url         : '/tasks/' + getTaskId(),
                beforeSend  : function() {
                    app.utility.isWorking($btn)
                },
                success     : function(data) {
                    if (data.ok) {
                        alert('删除成功')
                        location.href = '/'
                    } else {
                        alert(data.msg)
                    }
                }
            })
        }
    }

    function archiveTask($btn) {
        $.ajax({
            type        : 'put',
            url         : '/tasks/' + getTaskId() + '/archive',
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (data.ok) {
                    location.href = '/'
                } else {
                    alert(data.msg)
                }
            }
        })
    }

    function resetMilestoneForm() {
        $('.modal-footer-btns').hide()
        $('#upsertMilestoneModal h3').html('添加时间点')
        $('#customMilestoneNameInput').val('')
        $('#upsertMilestoneForm input[name="eventTime"]').val('')
        $('#upsertMilestoneForm textarea').html('')
        $('#upsertMilestoneForm').data('id', '')
    }

    function readyToUpsertMilestone(event, $btn) {
        if (app.utility.isValidForm('upsertMilestoneForm')) {
            startUpsertMilestone($btn)
            event.preventDefault() 
        }
    }

    function startUpsertMilestone($btn) {
        var url             = $('#upsertMilestoneForm').attr('action'),
            type            = 'post',
            milestoneId     = $('#upsertMilestoneForm').data('id');

        if (milestoneId) {
            url     = url + '/' + milestoneId
            type    = 'put'
        }

        $.ajax({
            type        : type,
            url         : url,
            data        : $('#upsertMilestoneForm').serialize(),
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

    function readyToEditMilestone($milestoneName) {
        $('.modal-footer-btns').show()
        $('#upsertMilestoneModal h3').html('编辑时间点')
        $('#customMilestoneNameInput').val($milestoneName.html())
        $('#upsertMilestoneForm input[name="eventTime"]').val($milestoneName.data('time'))
        $('#upsertMilestoneForm textarea').val($milestoneName.data('original-title'))
        $('#upsertMilestoneForm select').hide()
        $('#customMilestoneNameInput').show()
        $('#customMilestoneNameBtn').html('选择常用事件')
        $('#upsertMilestoneForm').data('id', $milestoneName.data('id'))
        $('#upsertMilestoneModal').modal()
    }

    function showCustomEvent() {
        $('#customMilestoneNameInput').show()
        $('#upsertMilestoneForm select').hide().val('')
        $('#customMilestoneNameBtn').html('选择常用事件')
    }

    function showCommEvent() {
        $('#customMilestoneNameInput').hide().val('')
        $('#upsertMilestoneForm select').show()
        $('#customMilestoneNameBtn').html('自定义事件名称')
    }

    function deleteMilestone($btn) {
        var sure = confirm('确认删除？')
        if (sure) {
            $.ajax({
                type        : 'delete',
                url         : '/milestones/' + $('#upsertMilestoneForm').data('id'),
                beforeSend  : function() {
                    app.utility.isWorking($btn)
                },
                success     : function(data) {
                    if (data.ok) {
                        alert('删除成功')
                        location.href = location.href
                    } else {
                        alert(data.msg)
                    }
                }
            })
        }
    }

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
                    insertStatusBtn('验收通过')
                }

                if (role.indexOf('Programmer') > -1) {
                    insertStatusBtn('开发已完成')
                }

                if (role.indexOf('Tester') > -1) {
                    insertStatusBtn('Master测试通过')
                    insertStatusBtn('Test测试通过')
                    insertStatusBtn('Dev测试通过')
                    insertStatusBtn('测试拒绝')
                }

                btnGroup.forEach(function(item, index) {
                    $('.change-status-btn-group .btn-group .dropdown-menu').append('<li><a href="#">' + item + '</a></li>')
                })

                $('.change-status-btn-group .btn-group .dropdown-menu a').click(function(event) {
                    showStatusForm($(this).html())
                    event.preventDefault()
                })
            }
        })
    }

    function showStatusForm(statusName) {
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

    function eventBind() {
        $('#addMoreTaskUserBtn').click(function(event) {
            addMoreTaskUserInput()
            event.preventDefault()
        })

        $('#addMoreProjectBtn').click(function(event) {
            addMoreProjectInput()
            event.preventDefault()
        })

        //edit task name btn
        $('#editTaskBtn').click(function(event) {
            $('#editTaskModal').modal()
            event.preventDefault()
        })

        $('#saveTask').click(function(event) {           
            var self = this
            readyToEditTask.call(self, event)
        })

        //get the new task custom id
        $('#getNewCustomId').click(function(event) {
            getNewCustomId()
            event.preventDefault()
        })

        //delete task btn
        $('#deleteTaskBtn').click(function() {
            deleteTask($(this))
        })

        //archive task btn
        $('#archiveTaskBtn').click(function() {
            archiveTask($(this))
        })

        //add task milestone btn
        $('#addMilestoneBtn').click(function() {
            resetMilestoneForm()
            $('#upsertMilestoneModal').modal()
        })

        //submit task milestone btn
        $('#saveMilestoneBtn').click(function(event) {
            readyToUpsertMilestone.call(this, event, $(this))
        })

        //custome milestone name btn
        $('#customMilestoneNameBtn').click(function(event) {
            if ($('#customMilestoneNameInput:visible').length > 0) {
                showCommEvent()
            } else {
                showCustomEvent()
            }

            event.preventDefault()
        })

        $('.milestone-name').click(function(event) {
            readyToEditMilestone($(this))
            event.preventDefault()
        })

        //delete milestone
        $('#deleteMilestoneBtn').click(function(event) {
            deleteMilestone($(this))
            event.preventDefault()
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

        $('.delete-this-status').click(function() {
            deleteStatus.call(this)
        })

        // complete todo
        $('span.un-complete, span.complete').click(function(){
            changeCompleteStatus.call(this)
        }) 

    }

    $(function() {
        eventBind()

        app.utility.highlightCurrentPage('任务')

        typeaheadUser();

        typeaheadProject();

        $('.milestone-name').tooltip()

        app.viewhelper.markDifferentColorToTaskStatus($('.task-summary-version .status-name span.label'))

        setChangeStatusBtnGroup()

        app.utility.highlightTaskNav('摘要');

        app.viewhelper.setFileIcon()
        app.viewhelper.markDifferentColorToTaskStatus($('.status span.label'))
        app.viewhelper.markDifferentColorToTodoCategory($('.task-summary-todo .category span.label'))
        
    })

    

    

    

    function changeCompleteStatus() {
        var status = 1
        if ($(this).attr('class') == 'complete') {
            $(this).attr({
                'class' : 'un-complete',
                'title' : '标记事项已完成'
            })
            status = 0
        } else {
            $(this).attr({
                'class' : 'complete',
                'title' : '标记事项未完成'
            })
        }

        var todoId = $(this).parent().data('id')
        $.ajax({
            type        : 'put',
            url         : '/tasks/' + getTaskId() + '/todos/' + todoId,
            data        : { complete : status},
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                } 
            }
        })
    }
})()