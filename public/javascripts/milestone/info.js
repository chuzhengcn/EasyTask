(function() {
    $(function() {
        app.utility.highlightCurrentPage('任务')
        eventBind()
        setMilestoneOriginNameInRightWay()
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

        $('#edit_task_milestone_form').submit(function(event) {
            readyToEditMilestone.call(this, event)
        })
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
                        location.href = getTaskUrl()
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
                location.href = getTaskUrl()
            }
        })
    }


    function getMilestoneId() {
        return $('.breadcrumb li.active').data('id')
    }

    function editMilestoneIsWorking() {
        $('#edit_task_milestone_form_btn').html('提交中...').addClass('disabled').off()
    }

    function setMilestoneOriginNameInRightWay() {
        var originName = $('#custom_milestone_name_input').val()
        var isInSelect = false
        $('#edit_task_milestone_form select option').each(function(index, value) {
            if ($(this).val() == originName) {
                $(this).attr('selected', 'selected')
                $('#custom_milestone_name_input').val('').hide()
                isInSelect = true
            }
        })

        if (!isInSelect) {
            $('#edit_task_milestone_form select').val('').hide()
            $('#custom_milestone_name').html('选择常用事件')
            $('#custom_milestone_name').toggle(selectMilestone, customMilestone)
            $('#custom_milestone_name_input').show()
        } else {
            $('#custom_milestone_name').toggle(customMilestone, selectMilestone)
        }

        function selectMilestone() {
            $('#custom_milestone_name_input').hide().val('')
            $('#edit_task_milestone_form select').show()
            $('#custom_milestone_name').html('选择常用事件')
        }

        function customMilestone() {
            $('#custom_milestone_name_input').show()
            $('#edit_task_milestone_form select').hide().val('')
            $('#custom_milestone_name').html('自定义事件名称')
        }
    }

    function getTaskUrl() {
        return $('.breadcrumb a:eq(1)').attr('href')
    }

})()