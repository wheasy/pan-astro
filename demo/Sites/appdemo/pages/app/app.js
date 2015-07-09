Mo.require('autocomplete-plugin,mask,focus-help', function(M) {
    // Mt.on('ready', function() {
    //默认页面
    var urlParam = M.Lang.getUrlParam(location.href);
    var mbody = M.one('body');

    var app_cfg = {
        routerBase: '',
        title: '',
        router: {
            '/home': {
                view: 'demo',
                title: '首页',
                isHome: true
            },
            '/url/:aid': {
                view: 'url',
                title: '获取URL上querystring参数实例'
            },
            '/touch': {
                view: 'touch',
                title: 'touch组件示例'
            },
            '/imgdemo': {
                view: 'imgdemo',
                title: 'img延迟加载'
            }
        }
    };
    //回到顶部    
    var DOM_GOTOP = M.role('gotop');
    var scrollBoundary = M.one(document).get('region').height * 2;
    DOM_GOTOP.on('click', function() {
        document.body.scrollTop = 0;
    });
    M.one(document).on('scroll', function(evt) {
        // return;
        if (document.body.scrollTop >= scrollBoundary) {
            DOM_GOTOP.show();
            return;
        }
        DOM_GOTOP.hide();
    });
    //回到顶部    END


    init_app();

    function init_app() {
        var app = Mt.createApp((app_cfg));
        // M.one(window).fire('mhashChange', app.router);
    }

});