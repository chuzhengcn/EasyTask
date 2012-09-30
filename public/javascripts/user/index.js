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
}