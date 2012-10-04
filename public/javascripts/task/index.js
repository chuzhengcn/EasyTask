(function() {
    $(function() {
        app.utility.highlightCurrentPage('任务')
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
        $('input[name="task_users"]:first').clone().insertBefore($('#add_more_task_user'))
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
                    var sureToUnknownUser = confirm('未知参与者\n\n' + userName + '\n\n是否继续创建该任务？')
                    if (!sureToUnknownUser) {
                        agree = false
                    }
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
            } else {
            }
            event.preventDefault() 
        }
    }

    function createTaskIsWorking() {
        $('#create_task_btn').html('提交中...').addClass('disable').off()
    }

    function satrtCreateTask() {
        $.ajax({
            type        : 'post',
            url         : $('#create_task_form').attr('action'),
            data        : $('#create_task_form').serialize(),
            success     : function(data) {
                if (data.ok) {
                    location.href = location.href
                } else {
                    createTaskIsComplete()
                    alert(data.msg)
                }
            }
        })
    }

    function createTaskIsComplete() {
        $('#create_task_btn').html('提交').removeClass('disable').on('click', function(event) {
            var self = this
            readyToCreateTask.call(self, event)
        })
    }
})()