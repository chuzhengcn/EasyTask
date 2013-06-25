(function() {
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
        $('#add_milestone_in_taskinfo').click(function() {
            app.utility.showRightSideBar()
            $('#add_task_milestone_form_wrapper').show()
        })

        //submit task milestone btn
        $('#add_task_milestone_form_btn').click(function(event) {
            readyToAddMilestone.call(this, event, $(this))
        })

        //custome milestone name btn
        $('#custom_milestone_name').toggle(
            function() {
                $('#custom_milestone_name_input').show()
                $('#add_task_milestone_form select').hide().val('')
                $(this).html('选择常用事件')
            },
            function() {
                $('#custom_milestone_name_input').hide().val('')
                $('#add_task_milestone_form select').show()
                $(this).html('自定义事件名称')
            }
        )

        //add task milestone btn
        $('#task_branch_btn').click(function() {
            app.utility.showRightSideBar()
            $('#task_branch_form_wrapper').show()
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

        app.utility.highlightTaskNav('摘要');

        app.viewhelper.setFileIcon()
        app.viewhelper.markDifferentColorToTaskStatus($('.status span.label'))
        app.viewhelper.markDifferentColorToTodoCategory($('.task-summary-todo .category span.label'))
        
    })

    function readyToAddMilestone(event, $btn) {
        if (app.utility.isValidForm('add_task_milestone_form')) {
            startAddMilestone($btn)
            event.preventDefault() 
        }
    }

    function startAddMilestone($btn) {
        $.ajax({
            type        : 'post',
            url         : $('#add_task_milestone_form').attr('action'),
            data        : $('#add_task_milestone_form').serialize(),
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