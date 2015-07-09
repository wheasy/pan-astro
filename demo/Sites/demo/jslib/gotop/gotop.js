$(function() {
    var DOM_ToTop = $('<div class="gotop" style="display:none">回到顶部</div>');
    $('footer').append(DOM_ToTop);
    DOM_ToTop.click(function(){
        $(document).scrollTop(0);
    });
    $(window).scroll(function() {
        DOM_ToTop.toggle($(document).scrollTop() > 100);
    });
});