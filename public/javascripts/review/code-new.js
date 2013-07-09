(function() {
    function saveReview($btn, $form) {
        var sendToServerDate = {},
            key              = '',
            isValide         = true;

         $form.find('input').each(function() {
            var name = $(this).attr('name')

            if (name in sendToServerDate) {
                return
            }

            if ($(this).attr('type') === 'radio') {
                sendToServerDate[name] = $form.find('input[name="'+ name +'"]:checked').val()
            } else {
                sendToServerDate[name] = $(this).val()                
            }
        })

        sendToServerDate.description = $form.find('textarea').val()

        for (key in sendToServerDate) {
            if (!sendToServerDate[key]) {
                isValide = false
                break
            }
        }

        if (!isValide) {
            alert('所有选项必填')
            return
        }

        $.ajax({
            type        : 'post',
            url         : $form.attr('action'),
            data        : sendToServerDate,
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (data.ok !== 1) {
                    alert(data.msg)
                    return
                }
                alert('添加成功')
                location.href = location.href
            }
        })
    }

    function deleteReview($btn) {
        var sure = confirm('确认删除？')
        if (!sure) {
            return
        }

        $.ajax({
            type        : 'delete',
            url         : $btn.attr('href'),
            beforeSend  : function() {
                app.utility.isWorking($btn)
            },
            success     : function(data) {
                if (data.ok !== 1) {
                    alert('删除失败，刷新页面后重试')
                }

                location.href = location.href
            } 
        })
    }

    function bindSaveReview($btn, $form) {
        $btn.click(function(event) {
            saveReview($btn, $form)
            event.preventDefault()
        }) 
    }

    $(function() {
        app.utility.highlightCurrentPage('代码检视')

        bindSaveReview($("#saveType1Btn"), $('#type1Form'))

        $('.delete-review-btn').click(function(event) {
            deleteReview($(this))
            event.preventDefault()
        })       
    })

})()