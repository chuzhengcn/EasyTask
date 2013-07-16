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
        $('.user-and-socre:first').clone().insertBefore($('#addMoreTaskUserBtn')).find('input').val('')
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

    function getTaskCustomId() {
        return $('.list-header header').data('custom-id')
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
        $('#upsertMilestoneForm textarea').val($milestoneName.data('content'))
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

    

    function fetchOpenBugList() {
        $.ajax({
            url         : '/tasks/' + getTaskId() + '/bugs',
            data        : { closed : false },
            beforeSend  : function() {
                $('#bugList').hide()
                $('#fetchBugProgress').show()
            },
            success : function(data) {
                if (data.ok !== 1) {
                    $('#fetchBugProgress').hide()
                    alert(data.msg)
                    return
                }

                displayBugs(data.bugs)
            }
        })
    }

    function displayBugs(bugs) {
        $('#bugList tbody').empty()

        bugs.forEach(function(item, index) {
            $('#bugList tbody').append('<tr><td class="index">' 
                + (bugs.length - index)
                + '</td><td><a href="/tasks/'
                + getTaskCustomId()
                + '/bugs/'
                + item._id
                + '">'
                + item.name 
                + '</a></td><td><span class="label bug-status">'
                + item.status
                + '</span></td><td>'
                + item.score
                + '</td><td>'
                + item.level
                + '</td><td>'
                + ((item.programmer&&item.programmer.name) || "无")
                + '</td><td>'
                + (item.updated_time.length > 16? item.updated_time.substring(5) : item.updated_time)
                + '</td><td>'
                + item.operator.name
                + '</td><td>'
                + showProperStatusBtn(item.status)
                + '</td><td><span class="badge">'
                + item.comments.length
                + '</span></td><td><i class="icon-picture" title="预览"></i><i class="edit-bug icon-edit" title="编辑"></i>'
                + '</td></tr>')
            $('#bugList tbody tr:last').data(item)
        })   

        $('#bugList').show()
        $('#fetchBugProgress').hide()

        displayBugCount()
        app.viewhelper.markDifferentColorToBugStatus($('.bug-status'))
    }

    function showProperStatusBtn() {
        var role    = localStorage.getItem("userRole");
            html    = ''            

        function insertStatusBtn(name, btnclass) {
            if (html.indexOf(name) === -1) {
                html = html + '<button class="btn btn-mini '+ btnclass +'">' + name +'</button>'
            }
        }

        if (role.indexOf('Programmer') > -1) {
            insertStatusBtn('解决中', 'btn-warning')
            insertStatusBtn('已修改', 'btn-info')
            insertStatusBtn('挂起', 'btn-inverse')
        }

        if (role.indexOf('Tester') > -1) {
            insertStatusBtn('未解决', 'btn-danger')
            insertStatusBtn('已解决', 'btn-success')
            insertStatusBtn('挂起', 'btn-inverse')
        } 

        insertStatusBtn('挂起', 'btn-inverse')

        return '<div class="btn-group change-bug-status">' + html + '</div>'

    }

    function displayBugCount() {
        var bugCount = {}

        $('#bugFilter button').each(function() {
            $(this).find('strong').remove()
            bugCount[$(this).text()] = 0
        })

        $('#bugList tbody tr').each(function() {
            bugCount[$(this).data('status')]++
        })

        bugCount['全部'] = $('#bugList tbody tr').size()

        $('#bugFilter button').each(function() {
            var count = bugCount[$(this).text()]
            $(this).append('<strong>' + count + '</strong>')
        })
    }

    function filterBugs($btn) {
        var statusName = $btn.find('span').text()

        if ($btn.hasClass('active')) {
            return
        }

        if ($btn.html() ===  $('#bugFilter button:first').html()) {
            fetchOpenBugList()
            return
        }

        $('#bugList tbody tr').each(function() {
            if (statusName === $(this).data('status')) {
                $(this).show()
            } else {
                $(this).hide()
            }
        })
    }

    function showBugPreview($btn) {
        var bugInfo = $btn.parent().parent().data()
        $('#previewBugModal h3').html(bugInfo.name)
        $('#previewBugModal .modal-body').html(bugInfo.content)
        $('#previewBugModal').modal()

    }

    function startChangeBugStatus($btn) {
        var status  = $btn.text(),
            $tr     = $btn.parent().parent().parent(),
            bugInfo = $tr.data();


        $.ajax({
            type        : 'put',
            url         : '/tasks/' + bugInfo.task_id + '/bugs/' + bugInfo._id + '/change-status',
            data        : {status : status},
            beforeSend  : function() {
                $('#fetchBugProgress').show()
            },
            success     : function(data) {
                $('#fetchBugProgress').hide()

                if (data.ok !== 1) {
                    alert(data.msg)
                    return
                }
                $tr.find('.bug-status').html(status)
                $tr.data('status', status)
                displayBugCount()
                app.viewhelper.markDifferentColorToBugStatus($('.bug-status'))

                if (!$('#bugFilter button:first').hasClass('active')) {
                    $tr.hide()
                }
            }
        })
    }

    function showAddRatingForm() {
        $('#upsertRatingModal input[type="radio"]').removeAttr('checked')
        $('#upsertRatingModal').modal()
    }

    function saveRating($btn) {

        if ($('#upsertRatingForm input[type="radio"]:checked').length === 0) {
            alert('没有选择评价')
            return
        }

        $.ajax({
            type        : 'put',
            url         : $('#upsertRatingForm').attr('action'),
            data        : $('#upsertRatingForm').serialize(),
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

    function deleteRating($btn) {
        var sure = confirm('确认删除？')
        if (sure) {
            $.ajax({
                type        : 'delete',
                url         : '/tasks/' + getTaskId() + '/rating-delete',
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

        $('#bugFilter button').click(function() {
            filterBugs($(this))
        })

        //preview bug
        $('#bugList tbody').delegate('tr i.icon-picture', 'click', function(event) {
            showBugPreview($(this))
        })

        //change bug status
        $('#bugList tbody').delegate('.change-bug-status button', 'click', function(event) {
            startChangeBugStatus($(this))
        })

        //edit bug
        $('#bugList tbody').delegate('.edit-bug', 'click', function(event) {
            var bug = $(this).parent().parent().data()

            location.href= '/tasks/' + getTaskCustomId() + '/bugs/' + bug._id + '/edit'
        })

        // add rating
        $('#addRatingBtn').click(function() {
            showAddRatingForm()
        })

        //save rating
        $('#saveRatingBtn').click(function() {
            saveRating($(this))
        })

        // delete rating
        $('#deleteRatingBtn').click(function() {
            deleteRating($(this))
        })

    }

    $(function() {
        eventBind()

        app.utility.highlightCurrentPage('任务')

        typeaheadUser();

        typeaheadProject();

        $('.milestone-name').popover({placement : 'bottom', trigger : 'hover'})

        app.viewhelper.markDifferentColorToTaskStatus($('.task-summary-version .status-name span.label'))

        setChangeStatusBtnGroup()

        app.utility.highlightTaskNav('任务主页');

        fetchOpenBugList()

        app.viewhelper.markDifferentColorToTaskStatus($('.status span.label'))

        app.viewhelper.markDifferentColorToTodoCategory($('.task-summary-todo .category span.label'))
        
    })
})()