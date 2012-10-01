(function() {

    $(function() {
        app.utility.highlightCurrentPage('成员')
        eventBind()
    })

    function eventBind() {
        $('.create-wrapper button').click(function() {
            app.utility.showRightSideBar()
        })

        $('.button-close-pane').click(function() {
            app.utility.hideRightSideBar()
        })

        $('#create_user_btn').click(function(event) {
            createUser()
            event.preventDefault()
        })
    }

    function createUser() {
        if (form_is_valid('create_user_form')) {
            $.ajax({
                type        : 'post',
                url         : $('#create_user_form').attr('action'),
                data        : $('#create_user_form').serialize(),
                beforeSend  : function(xhr) {
                    createUserIsWorking()
                },
                success     : function(data) {
                    if (data.ok) {
                        location.href = location.href
                    }
                }
            })
        }
    }

    function form_is_valid(formId) {
        var valid = document.getElementById(formId).checkValidity()
        return valid
    }

    function createUserIsWorking() {
        $('#create_user_btn').html('提交中...').addClass('disable').off()
    } 
})()