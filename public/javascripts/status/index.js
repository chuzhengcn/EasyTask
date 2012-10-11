(function() {
    $(function() {
        app.utility.highlightCurrentPage('任务')
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
        })

        //submit task milestone btn
        $('#mark_task_status_form_btn').click(function(event) {
            readyToAddStatus.call(this, event, $(this))
        })

    }

    function setOriginTaskStatus() {
        app.viewhelper.setSelect('task_status_selecter')
    }

    function checkPaneNeedOpen() {
        if (app.utility.get_query_value('change') == 'true') {
            app.utility.showRightSideBar()
        }
    }
    
    function getTaskId() {
        return $('.breadcrumb li.active').data('id')
    }

    function readyToAddStatus(event, $btn) {
        if (app.utility.isValidForm('mark_task_status_form')) {
            startAddStatus($btn)
            event.preventDefault() 
        }
    }

    function startAddStatus($btn) {
        $.ajax({
            type        : 'post',
            url         : $('#mark_task_status_form').attr('action'),
            data        : $('#mark_task_status_form').serialize(),
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = location.protocol + '//' + location.hostname + location.pathname
            }
        })
    }

    
})()