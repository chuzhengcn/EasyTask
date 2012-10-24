(function() {
    $(function() {
        app.utility.highlightCurrentPage('任务')
        fillTaskStatusToFilter()
        eventBind()
    })

    function eventBind() {
        $('.operate-wrapper button').click(function() {
            app.utility.showRightSideBar()
            resetCreateTaskForm()
        })

        $('.button-close-pane').click(function() {
            app.utility.hideRightSideBar()
        })

        $('#add_more_task_user').click(function(event) {
            addMoreTaskUserInput()
            event.preventDefault()
        })

        $('#create_task_btn').click(function(event) {           
            var self = this
            readyToCreateTask.call(self, event)
        })
    }

    function addMoreTaskUserInput() {
        $('input[name="task_users"]:first').clone().insertBefore($('#add_more_task_user')).val('').focus()
    }

    function resetCreateTaskForm() {
        $('#create_task_form input[type="text"]').val('')
    }

    function agreePossibleUnknowUser() {
        var userOptionArray = [] 
        var agree           = true
        $('#task_users_option option').each(function() {
            userOptionArray.push($(this).val())
        })

        $('input[name="task_users"]').each(function() {
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
    
    function readyToCreateTask(event) {
        if (app.utility.isValidForm('create_task_form')) {
            if (agreePossibleUnknowUser()) {
                createTaskIsWorking()
                satrtCreateTask()
            } 
            event.preventDefault() 
        }
    }

    function createTaskIsWorking() {
        $('#create_task_btn').html('提交中...').addClass('disabled').off()
    }

    function satrtCreateTask() {
        $.ajax({
            type        : 'post',
            url         : $('#create_task_form').attr('action'),
            data        : $('#create_task_form').serialize(),
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
        $('#create_task_btn').html('提交').removeClass('disabled').on('click', function(event) {
            var self = this
            readyToCreateTask.call(self, event)
        })
    }

    function fillTaskStatusToFilter() {
        var currentStatus = app.utility.get_query_value('status') || app.utility.get_query_value('active')
        var taskBaseLink =  '/tasks'
        //mark current status
        if(currentStatus) {
            if (currentStatus == 'false') {
                $('#task_status_filter button:first').html('已存档')
            } else {
                $('#task_status_filter button:first').html(decodeURIComponent(currentStatus))
            }
        }

        $('#datalist_status_selecter option').each(function(index, value) {
            if (index == 0) {
                return
            }

            $('#task_status_filter .dropdown-submenu .dropdown-menu').append('<li><a href="'
                + taskBaseLink + '?status=' + $(this).val()
                + '">'
                + $(this).val()
                + '</a></li>')
        })
    }
})()