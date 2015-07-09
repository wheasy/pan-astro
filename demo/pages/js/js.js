var pan = require('pandorajs'),
    fs = require('fs'),
    path = require('path'),
    astro = require('pan-astro');

module.exports = pan.page({
    attrs: {
        type: 'js',
        title: 'less'
    },
    // init:function(a){
    //     //new 的时候调用
    // },

    process: function(request, response) {
        var params = this.get('params');
        var pname = params.pagename.split('.')[0];
        astro.compress.parse_js({
            projectName: params.prjname,
            pageName: pname,
            isCompress: false,
            isPageJs:true,
            callback: function(jscode) {
                response.$write(jscode, true);
            }
        });
    }
});