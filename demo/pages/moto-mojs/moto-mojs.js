/*
 *  Moto的核心JS和Moto的JS组件
 */
var pan = require('pandorajs'),
    moto = require('mo-moto');

module.exports = pan.page({
    attrs: {
        type: 'js',
        title: ''
    },
    process: function(request, response) {
        var params = this.get('params');
        var projectName = params.prjname;
        response.$write(moto.getMotoSeedJs(projectName), true);
    }
});