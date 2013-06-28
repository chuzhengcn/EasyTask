(function() {
    
    function readyToAddComment() {
        setTimeout(function() {
            $('#addCommentForm img').attr('src', localStorage.userAvatarUrl)
        }, 1000)

        $('#addCommentBtn').click(function(event) {
            submitCommentForm.call(this, event, $(this))
        })
    }    

    function eventBind() {
        $('#bugSwitcher').click(function(){
            changeCompleteBug.call(this)
        })  

        //change bug status
        $('.change-bug-status').delegate('button', 'click', function(event) {
            startChangeBugStatus($(this))
        })     
    }

    function changeCompleteBug() {
        var switcher = $(this).text()

        $.ajax({
            type        : 'put',
            url         : '/tasks/' + getTaskId() + '/bugs/' + getBugId() + '/open-close',
            data        : {switcher : switcher},
            success     : function(data) {
                if (!data.ok) {
                    alert(data.msg)
                } 

                location.href = location.href 
            }
        })
    }

    function getTaskId() {
        return $('.list-header header').data('id')
    }

    function getBugId() {
        return $('.bug-info').data('id')
    }

    function submitCommentForm(event, $btn) {
        if (app.utility.isValidForm('addCommentForm')) {
            event.preventDefault() 
            $.ajax({
                type        : 'put',
                url         : $('#addCommentForm').attr('action'),
                data        : $('#addCommentForm').serialize(),
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
    }

    function showProperStatusBtn() {
        var role    = localStorage.getItem("userRole");
            html    = ''            

        function insertStatusBtn(name, btnclass) {
            if (html.indexOf(name) === -1) {
                html = html + '<button class="btn btn-small '+ btnclass +'">' + name +'</button>'
            }
        }

        if (role.indexOf('Programmer') > -1) {
            insertStatusBtn('解决中', 'btn-warning')
            insertStatusBtn('已解决', 'btn-info')
            insertStatusBtn('挂起', 'btn-inverse')
        }

        if (role.indexOf('Tester') > -1) {
            insertStatusBtn('未解决', 'btn-danger')
            insertStatusBtn('测试通过', 'btn-success')
            insertStatusBtn('挂起', 'btn-inverse')
        } 

        insertStatusBtn('挂起', 'btn-inverse')

        $('.change-bug-status').html(html)

    }

    function startChangeBugStatus($btn) {
        var status  = $btn.text();


        $.ajax({
            type        : 'put',
            url         : '/tasks/' + getTaskId() + '/bugs/' + getBugId() + '/change-status',
            data        : {status : status},
            success     : function(data) {
                if (data.ok !== 1) {
                    alert(data.msg)
                    return
                }

                location.href = location.href
            }
        })
    }

    $(function() {
        app.utility.highlightCurrentPage('任务')

        app.utility.highlightTaskNav('Bug')

        app.viewhelper.markDifferentColorToBugStatus($('dd span.label'))

        eventBind()

        readyToAddComment()

        showProperStatusBtn()
    })

})()