var pan = require('pandorajs');
    astro = require('pan-astro');

module.exports = pan.page({
    attrs: {
        type: 'js',
        title: ''
    },
    process: function(request, response) {

        var params = this.get('params');
        var pname = params.pagename.split('.')[0];
        astro.compress.parse_js({
            projectName: params.prjname,
            pageName: pname,
            isCompress: false,
            callback: function(jscode) {
                response.$write(jscode, true);
            },
            isMoto: true
        });


        // var params = this.get('params');

        // response.$write(moto.getAppJS(params.prjname), true);
    }
});