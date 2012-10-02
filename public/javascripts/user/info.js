(function() {

    $(function() {
        app.utility.highlightCurrentPage('成员')
        app.viewhelper.setSelect('role_select')
        eventBind()
    })

    function eventBind() {
        $('.operate-wrapper button.btn-primary').click(function() {
            app.utility.showRightSideBar()
        })

        $('.operate-wrapper button.btn-danger').click(function() {
            deleteUser()
        })

        $('.button-close-pane').click(function() {
            app.utility.hideRightSideBar()
        })

        $('#edit_user_btn').click(function(event) {
            editUser()
            event.preventDefault()
        })
    }

    function editUser() {
        if (form_is_valid('edit_user_form')) {
            $.ajax({
                type        : 'put',
                url         : $('#edit_user_form').attr('action'),
                data        : $('#edit_user_form').serialize(),
                beforeSend  : function(xhr) {
                    editUserIsWorking()
                },
                success     : function(data) {
                    if (data.ok) {
                        location.href = location.href
                    }
                }
            })
        }
    }

    function deleteUser() {
        var sure = confirm('确认删除？')
        if (sure) {
            $.ajax({
                type        : 'delete',
                url         : '/users/' + $('#edit_user_form input[name="id"]').val(),
                success     : function(data) {
                    if (data.ok) {
                        alert('删除成功')
                        location.href = '/users'
                    }
                }
            })
        }
    }

    function form_is_valid(formId) {
        var valid = document.getElementById(formId).checkValidity()
        return valid
    }

    function editUserIsWorking() {
        $('#edit_user_btn').html('提交中...').addClass('disable').off()
    } 
})()