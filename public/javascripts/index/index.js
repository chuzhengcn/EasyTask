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
        $('#createTaskForm input[type="text"]').val('')
    }

    function addMoreTaskUserInput() {
        $('input[name="taskUsers"]:first').clone().insertBefore($('#addMoreTaskUserBtn')).val('').focus()
    }

    function agreePossibleUnknowUser() {
        var userOptionArray = [] 
        var agree           = true
        $('#taskUsersOption option').each(function() {
            userOptionArray.push($(this).val())
        })

        $('input[name="taskUsers"]').each(function() {
            var userName = $(this).val()
            if (userName !== '') {
                if (userOptionArray.indexOf(userName) == -1) {
                    alert('未知参与者\n\n' + userName + '\n\n不能包含该人员')
                    agree = false
                }
            }
        })

        return agree
    }

    function createTaskIsWorking() {
        $('#saveTask').html('提交中...').addClass('disabled').off()
    }

    function readyToCreateTask(event) {
        if (app.utility.isValidForm('createTaskForm')) {
            if (agreePossibleUnknowUser()) {
                createTaskIsWorking()
                satrtCreateTask()
            } 
            event.preventDefault() 
        }
    }

    function satrtCreateTask() {
        $.ajax({
            type        : 'post',
            url         : $('#createTaskForm').attr('action'),
            data        : $('#createTaskForm').serialize(),
            success     : function(data) {
                if (data.ok) {
                    location.href = '/tasks/' + data.id
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

        $('#saveTask').click(function(event) {           
            var self = this
            readyToCreateTask.call(self, event)
        })

    }

    function popoverTaskInfo() {
        $('span[rel="popover"]').each(function() {
            $(this).data('content',$(this).next().html())
        })
        $('span[rel="popover"]').popover({
            trigger     : 'hover'
        })
    }

    

    

    
    
    

    

    

    function fillTaskStatusToFilter() {
        var taskBaseLink =  '/tasks'
        //mark current status

        $('#datalist_status_selecter option').each(function(index, value) {
            if (index == 0) {
                return
            }

            $('#task_status_filter .dropdown-menu').append('<li><a href="'
                + taskBaseLink + '?status=' + $(this).val()
                + '">'
                + $(this).val()
                + '</a></li>')
        })
    }

    function fillTaskBranchToFilter() {
        var currentBranch = app.utility.get_query_value('branch')
        if (currentBranch) {
            $('#task_branch_filter button:first').html(decodeURIComponent(currentBranch))
        }
    }

    function fillTaskUserToFilter() {
        var currentUserId = app.utility.get_query_value('user')
        if (currentUserId) {
            $('#task_user_filter span.name').each(function() {
                if ($(this).data('id') == currentUserId) {
                    $('#task_user_filter button:first').html($(this).text())
                }
            })
        }
    }

    $(function() {
        typeaheadUser();

        typeaheadProject();

        eventBind()
        app.utility.highlightCurrentPage('任务')
        fillTaskStatusToFilter()
        fillTaskBranchToFilter()
        fillTaskUserToFilter()
        popoverTaskInfo()
        app.viewhelper.markDifferentColorToTaskStatus($('.task-list li .status span.label'))
    })

})()