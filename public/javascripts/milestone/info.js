(function() {
    $(function() {
        app.utility.highlightCurrentPage('任务')
        // eventBind()
    })

    function eventBind() {
        //delete task btn
        $('#delete_milestone_btn').click(function() {
            deleteMilestone()
        })

        //submit task milestone btn
        $('#edit_task_milestone_form_btn').click(function(event) {
            readyToEditMilestone.call(this, event)
        })

        //custome milestone name btn
        $('#custom_milestone_name').toggle(
            function() {
                $('#custom_milestone_name_input').show()
                $('#add_task_milestone_form select').hide()
                $(this).html('选择常用事件')
            },
            function() {
                $('#custom_milestone_name_input').hide()
                $('#add_task_milestone_form select').show()
                $(this).html('自定义事件名称')
            }
        )
    }

    function deleteMilestone() {
        var sure = confirm('确认删除？')
        if (sure) {
            $.ajax({
                type        : 'delete',
                url         : '/milestones/' + getMilestoneId(),
                success     : function(data) {
                    if (data.ok) {
                        alert('删除成功')
                        location.href = $('.breadcrumb a:eq(1)').attr('href')
                    } else {
                        alert(data.msg)
                    }
                }
            })
        }
    }


    function readyToEditMilestone(event) {
        if (app.utility.isValidForm('edit_task_milestone_form')) {
            startEditMilestone()
            editMilestoneIsWorking()
            event.preventDefault() 
        }
    }

    function startEditMilestone() {
        $.ajax({
            type        : 'put',
            url         : $('#edit_task_milestone_form').attr('action'),
            data        : $('#edit_task_milestone_form').serialize(),
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                }
                location.href = location.href
            }
        })
    }


    function getMilestoneId() {
        return $('.breadcrumb li.active').data('id')
    }

    function editMilestoneIsWorking() {
        $('#edit_task_milestone_form_btn').html('提交中...').addClass('disabled').off()
    }
    
})()