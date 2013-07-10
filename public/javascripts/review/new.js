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
                location.href = location.href.split('?')[0] + '?type=' + sendToServerDate.type
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

    function setTab() {
        var tabTypeValue,
            targetId;

        tabTypeValue = app.utility.get_query_value('type')

        if (!tabTypeValue) {
            return
        }

        targetId = $('input[value="'+ tabTypeValue +'"]').parent().parent().attr('id')

        $('#reviewTab a[href="#'+ targetId +'"]').tab('show')

        $('#reviewTab a').click(function(event) {
            event.preventDefault()

            $(this).tab('show')
        })
    }

    $(function() {
        app.utility.highlightCurrentPage('评价')

        bindSaveReview($("#saveType1Btn"), $('#type1Form'))
        bindSaveReview($("#saveType2Btn"), $('#type2Form'))
        bindSaveReview($("#saveType3Btn"), $('#type3Form'))
        bindSaveReview($("#saveType4Btn"), $('#type4Form'))
        bindSaveReview($("#saveType5Btn"), $('#type5Form'))

        $('.delete-review-btn').click(function(event) {
            deleteReview($(this))
            event.preventDefault()
        })

        setTab()       
    })

})()