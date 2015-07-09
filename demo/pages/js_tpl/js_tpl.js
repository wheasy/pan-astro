var pan = require('pandorajs'),
    fs = require('fs'),
    path = require('path'),
    astro = require('pan-astro');

module.exports = pan.page({
    attrs:{
        type:  'js',
        title: 'less'
    },
    // init:function(a){
    //     //new 的时候调用
    // },

    process:function(request, response){
        var params = this.get('params');
//读取_tpls目录
//遍历文件，处理，并替换后返回
        response.$write(astro.compress.parse_js_tpl(params.prjname), true);
// this.render();
    }
});