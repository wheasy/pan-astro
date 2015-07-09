var pan = require('pandorajs');
var astro = require('pan-astro');
var path = require('path');
var fs = require('fs');

module.exports = pan.page({
    attrs: {
        title: '首页'
    },
    init:function(a){
    },

    process: function(request, response) {
        var params = this.get('params');
        var c = astro.compiler;
        var projectName = params.prjname;
        var pageName = params.pagename;
        var projectCfg = c.getProjectCfg(projectName);

        if (!projectCfg) {
            console.log('项目未找到' + projectName + '<br/>' + path.join(projectName, 'config'));
            response.$write('项目未找到' + projectName + '<br/>' + path.join(projectName, 'config'), true);
            return;
        }
        var cdn = projectCfg.cdn || projectName;
        if (request.$params.publish === 'true') {
            cdn = '..';
        }
        this.set('$cdn', cdn);

        var pageObj = c.getPagePerObject(projectName, pageName);
        if (pageObj) {
            var pageInfo = c.getPage(projectName, pageName);
            this.set('$hasJs', !!pageInfo.js);
            this.set('$hasCss', !!pageInfo.less);
            this.data.$page = this;
            this.data.$scripts = function() {
                var s = astro.compress.parse_js({
                    projectName: projectName,
                    pageName: pageName,
                    isCompress: false
                });
                var str = '';
                s.forEach(function(jsObj) {
                    var url;
                    switch (jsObj.type) {
                        case 'module':
                            if (jsObj.name.indexOf('http:') > -1) {
                                url = jsObj.name;
                                break;
                            }
                            url = cdn +
                                (jsObj.name.charAt(0) == '~' ?
                                    jsObj.name.replace('~', '/js') :
                                    '/js/m/' + jsObj.name + '.js');
                            break;
                        case 'page':
                            url = cdn + '/js/p/' + jsObj.name + '.js';
                            break;
                        default:
                            url = jsObj.name;
                            break;
                    }
                    if (url) {
                        str += '<script src="' + url + '"></script>\n';
                    }
                });
                return str;
            };
            var html = pan.template.parse(pageObj.html, this.data);

            html = typeof html == 'function' ? html + '' : (html || '');
            // console.log('html',typeof html);
            // if(request.$params.publish){

            html = require('html-minifier').minify(
                html, {
                    // collapseWhitespace: true,
                    removeComments: true
                });
            // }
            if (html == '{Template Error}') {
                html += '<!-- ' + pageObj.html + ' -->'
            }
            response.$write(html, true);
            // response.$write(this.parse(pageObj.html, this.data) || '', true);
        } else {
            response.$write('页面未找到', true);
        }
    }
});