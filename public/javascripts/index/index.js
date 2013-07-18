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

    function resetCreateTaskForm() {
        $('#createTaskForm input').val('')
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
            validNum        = 0,
            has             = false;

        $('#taskUsersOption option').each(function() {
            userOptionArray.push($(this).val())
        })

        $('input[name="taskUsers"]').each(function() {
            var userName = $(this).val()
            if (userName !== '') {
                validNum++
                if (userOptionArray.indexOf(userName) == -1) {
                    alert('未知参与者\n\n' + userName + '\n\n不能包含该人员')
                    has = true
                }
            }
        })

        if (validNum === 0) {
            has = true
            alert('至少选择一个人员')
        }

        return has
    }

    function hasUnknowProject() {
        var projectOptionArray = [],
            validNum           = 0,
            has                = false;

        $('#projectOption option').each(function() {
            projectOptionArray.push($(this).val())
        })

        $('input[name="project"]').each(function() {
            var projectName = $(this).val()
            if (projectName !== '') {
                validNum++
                if (projectOptionArray.indexOf(projectName) == -1) {
                    alert('未知站点\n\n' + projectName + '\n\n不能包含该站点')
                    has = true
                }
            }
        })

        if (validNum === 0) {
            has = true
            alert('至少选择一个站点，不知道的话写 unknown')
        }

        return has
    }

    function createTaskIsWorking() {
        $('#saveTask').html('提交中...').addClass('disabled').off()
    }

    function readyToCreateTask(event) {
        // todo: 更好的提示
        if (app.utility.isValidForm('createTaskForm')) {
            if (!hasUnknowUser() && !hasUnknowProject()) {
                createTaskIsWorking()
                satrtCreateTask()
            } 
        } else {
            alert('表单不合法')
        }

        event.preventDefault() 
    }

    function satrtCreateTask() {
        $.ajax({
            type        : 'post',
            url         : $('#createTaskForm').attr('action'),
            data        : $('#createTaskForm').serialize(),
            success     : function(data) {
                if (data.ok) {
                    location.href = '/tasks/' + data.task.custom_id
                } else {
                    createTaskIsComplete()
                    alert(data.msg)
                }
            }
        })
    }

    function createTaskIsComplete() {
        $('#saveTask').html('提交').removeClass('disabled').on('click', function(event) {
            var self = this
            readyToCreateTask.call(self, event)
        })
    }

    function showAllTask() {
        $('.task-list li').slideDown()
    }

    function filterTaskByStatus($btn) {
        var statusName = $.trim($btn.text())

        if (statusName === '全部') {
            showAllTask()
            return
        }


        $('.task-list li').each(function() {

            var thisStatus = $.trim($(this).find('.status span').text())
            if (thisStatus === statusName) {
                $(this).slideDown()
            } else {
                $(this).slideUp()
            }
        })
        
    }

    function filterTaskByBranch($btn) {
        var branchName = $.trim($btn.text())

        if (branchName === '全部') {
            showAllTask()
            return
        }

        $('.task-list li').each(function() {
            var thisBranch = $.trim($(this).find('.branch').text())
            if (thisBranch.indexOf(branchName) > -1) {
                $(this).slideDown()
            } else {
                $(this).slideUp()
            }
        })
    }

    function filterTaskByUser($btn) {
        var userName = $.trim($btn.text())

        if (userName === '全部') {
            showAllTask()
            return
        }

        $('.task-list li').each(function() {
            var thisUsers = $.trim($(this).find('.users span[rel="popover"]').text())
            if (thisUsers.indexOf(userName) > -1) {
                $(this).slideDown()
            } else {
                $(this).slideUp()
            }
        })
    }

    function eventBind() {

        $('#createTaskBtn').click(function(event) {
            resetCreateTaskForm()
            $('#createTaskModal').modal()
            event.preventDefault()
        })

        $('#addMoreTaskUserBtn').click(function(event) {
            addMoreTaskUserInput()
            event.preventDefault()
        })

        $('#addMoreProjectBtn').click(function(event) {
            addMoreProjectInput()
            event.preventDefault()
        })

        $('#saveTask').click(function(event) {           
            var self = this
            readyToCreateTask.call(self, event)
        })

        $('#taskStatusFilter ul a').click(function(event) {
            filterTaskByStatus($(this))
            event.preventDefault()
        })

        $('#taskBranchFilter ul a').click(function(event) {
            filterTaskByBranch($(this))
            event.preventDefault()
        })

        $('#taskUserFilter ul a').click(function(event) {
            filterTaskByUser($(this))
            event.preventDefault()
        })

    }

    function popoverTaskInfo() {
        $('span[rel="popover"]').each(function() {
            $(this).data('content',$(this).next().html())
        })
        $('span[rel="popover"]').popover({
            trigger     : 'hover',
            html        : true,
        })
    }

    

    

    $(function() {
        app.utility.highlightCurrentPage('任务')

        typeaheadUser();

        typeaheadProject();

        eventBind()

        popoverTaskInfo()

        app.viewhelper.markDifferentColorToTaskStatus($('.task-list li .status span.label'))

        app.viewhelper.markDifferentColorToTaskStatus($('#taskStatusFilter span.label'))
    })

})()