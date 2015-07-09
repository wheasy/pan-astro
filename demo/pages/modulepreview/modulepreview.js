var pan = require('pandorajs');
var path = require('path');

module.exports = pan.page({
    attrs: {
        title: '首页'
    },
    // init:function(a){
    //     //new 的时候调用
    // },
    process: function(request, response) {
        var params = this.get('params');
        var projectName = params.prjname;
        var c = require('pan-astro').compiler;
        var projectCfg = c.getProjectCfg(projectName);
        if(!projectCfg) {
            console.log('项目未找到' + projectName + '<br/>' + path.join(mfile.getAbsolutePath(projectName), 'config'));
            response.$write('项目未找到' + projectName + '<br/>' + path.join(mfile.getAbsolutePath(projectName), 'config'), true);
            return;
        }

        this.set('$cdn', projectCfg.cdn || params.prjname);

        var pinfo = c.getModule(params.prjname, params.modulename);
        if (pinfo) {
            var ret = c.process(params.prjname, pinfo.code);
            // this.set('child_tpl_code' , ret.html);
            this.data.module_html = ret.html;
            this.data.module_code = pinfo.code;
            this.data.module_tag = '<module:'+params.modulename + ' />';

            this.data.$page = this;
            // response.$write(JSON.stringify(ret));
            // response.$write(this.parse(ret.html, this.data) || '', true);
            this.render();
        } else {
            response.$write('模块未找到：' + params.modulename, true);
        }
    }
});