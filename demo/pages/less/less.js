var pan = require('pandorajs'),
    fs = require('fs'),
    path = require('path'),
    astro = require('pan-astro');

module.exports = pan.page({
    attrs: {
        type: 'css',
        title: 'less'
    },
    init: function(a) {
        // console.log('less');
        //new 的时候调用
    },

    process: function(request, response) {
        var params = this.get('params');
        var i = params.pagename.lastIndexOf('.');
        i = i >= 0 ? i : params.pagename.length;
        var pname = params.pagename.substr(0, i);
        astro.compress.parse_less(params.prjname, pname, false, function(css) {
            response.$write(css, true);
        });
        // this.render();
    }
});