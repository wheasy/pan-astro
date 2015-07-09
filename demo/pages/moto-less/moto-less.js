var pan = require('pandorajs'),
    astro = require('pan-astro');

module.exports = pan.page({
    attrs: {
        type: 'css',
        title: ''
    },
    process: function(request, response) {
        var params = this.get('params');

        var pname = params.pagename;
        astro.compress.parse_less(params.prjname, pname, false, function(css){
            response.$write(css, true);
        }, true);

        // var params = this.get('params');
        // moto.getAppCss(params.prjname, params.pagename, function(css) {
        //     response.$write(css, true);
        // });
    }
});