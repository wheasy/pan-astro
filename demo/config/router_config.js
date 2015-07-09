module.exports = {
    'pages': {
        '/': {
            handle: 'project-list'
        },
        '/favicon.ico': {
            handle: 'resource'
        },
        /**************
         * moto
         **************/
        '/:prjname/js/mo-single.js': {
            handle: 'moto-mojs'
        },
        '/:prjname/js/:pagename/app.js': {
            handle: 'moto-js'
        },
        '/:prjname/css/:pagename/app.css': {
            handle: 'moto-less'
        },
        '/d_api/:source/*':{
            handle: 'd_api'
        },
        '/d_api/*':{
            handle: 'd_api'
        },
        /**************
         * moto end
         **************/
        // '/:prjname': { 
        //     method: 'get', //默认为get
        //     handle: 'homet'
        // },
        '/:prjname/': {
            method: 'get', //默认为get
            handle: 'home'
        },
        //查看页面 /项目名称/p/页面名称
        '/:prjname/:pagename': {
            handle: 'pagepreview'
        },
        //查看模块
        '/:prjname/m/:modulename': {
            handle: 'modulepreview'
        },
        //解析页面样式
        '/:prjname/css/p/:pagename': {
            handle: 'less'
        },
        //解析模块样式
        '/:prjname/css/m/:modulename': {
            handle: 'moduleless'
        },
        //解析JS
        '/:prjname/js/resource.js': {
            handle: 'js_tpl'
        },
        //解析JS
        '/:prjname/js/p/:pagename': {
            handle: 'js'
        },
        //页面应用引用的图片/img/p
        //模块中的图片/img/m
        //组件引用的图片/img/mj
        '/:prjname/img/(p|m|mj)/:mname/:imgname': {
            handle: 'img'
        },
        '/:prjname/*': {
            handle: 'resource'
        }        
    },
    'error': {
        'default': 'error',
        '404': ''
    }
}

///var/data/__cache/static/detail/11.html