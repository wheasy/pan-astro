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
        astro.compress.parse_module_less(params.prjname, params.modulename, function(css) {
            response.$write(css, true);
        });
    }
});