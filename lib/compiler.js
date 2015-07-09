var pan = require('pandorajs'),
    panUtil = require('pan-utils'),
    fs = require('fs'),
    mfile = panUtil.file,
    path = require('path'),
    watch = panUtil.watch,
    //单闭合 <module\:([a-z,A-Z,0-9,\-,\_]+)([^/]*?)/>
    //双闭合 <(module\:([a-z,A-Z,0-9,\-,\_]+))([^/]*?)>([\s\S]*)</\1>
    reg_module = /<(module\:([a-z,A-Z,0-9,\-,\_]+))([^\/]*?)(?:(?:>([\s\S]*)<\/\1>)|(?:\/>))/gi,
    reg_module_attrs = /(\w+)=['"]?([^"'\s]+)['"]?/ig,
    reg_module_pathinfo = {
        pages: /pages\/(.*?)[\/\\]?([^\/\\]+)[\/\\]?$/,
        modules: /modules\/(.*?)[\/\\]?([^\/\\]+)[\/\\]?$/,
        lilib: /lilib\/(.*?)[\/\\]?([^\/\\]+)[\/\\]?$/,
    },
    reg_comments = /\<\!\-\-[^\*][\s\S]*?\-\-\>/g,
    m_dir_hash = {
        'pages': 'p',
        'modules': 'm',
        'jslib': 'mj'
    };
var compiler = {
    /**
     * 获取项目配置
     * @param  {[type]} projectName [description]
     * @return {[type]}             [description]
     */
    getProjectCfg: function(projectName) {
        var prjCfg ;
        try{
            prjCfg = require(require('./help').getSiteFilePath(projectName, 'config'));
        }catch(e){
            prjCfg = null;
        }

        
        if(!prjCfg){
            return prjCfg;
        }
        if(prjCfg.$){
            return prjCfg;
        }

        prjCfg.$ = true;
        prjCfg.imgCdn = prjCfg.imgCdn || ('/' + projectName);
        // console.log('prjCfg.cdn1', prjCfg.cdn);
        prjCfg.cdn = prjCfg.cdn ? (prjCfg.cdn.indexOf('http:') > -1 ? '' : 'http://') + prjCfg.cdn : ('/' + projectName);
        // console.log('prjCfg.cdn2', prjCfg.cdn);
        prjCfg.combine = prjCfg.combine !== false;
        return prjCfg;
    },
    //解析页面
    process: function(projectName, code) {
        var less = [],
            js = [],
            ret, count = 0;
        code = code.replace(reg_comments, '');
        while (reg_module.test(code)) {
            if (++count == 100) {
                return '<div class="mo-error">Module循环引用超过100次</div>';
            }
            code = code.replace(reg_module, function(modcode, modstr, modname, attrs, modcontent) {
                // modstr, //module:modname
                // modname, //modname
                // attrs,//title=1 name=2
                // modcontent/*module 中间的内容*/
                var modinfo = compiler.processModule(projectName, modname);
                if (modinfo) {
                    less = less.concat(modinfo.less);
                    js = js.concat(modinfo.js);

                    var attrHash = {},
                        retStr = '',
                        mid = panUtil.util.guid('_');
                    if (reg_module_attrs.test(attrs)) {
                        attrs.replace(reg_module_attrs, function(str, name, value) {
                            attrHash[name] = value;
                        });
                    }
                    retStr = (' <?$attr=' + JSON.stringify(attrHash) + ';?> ' +
                        modinfo.code)
                    retStr = retStr.replace(/\$attr/ig, function(s) {
                        return s + mid;
                    }).replace(/\<\?\$mod_content\?\>/ig, function(s) {
                        return modcontent || '';
                    });

                    // console.log(retStr);
                    // debugger
                    // try {
                    //     pan.template.parse(retStr, {});
                    // } catch (err) {
                    //     console.log(err);
                    // }
                    // return mo.template.parse(retStr, {});
                    return retStr;
                } else {
                    return '<div class="mo-error">未找到模块:' + modname + '</div>';
                }
            });
        }
        return {
            html: code,
            js: js,
            less: less
        }
    },
    /**
     * 获得页面预处理对象
     * @method getPagePerObject
     * @param  {String}         projectName 项目名称
     * @param  {String}         pageName    页面名称
     * @return {Object}                     包括HTML代码，依赖的模块LESS和JS（即业务代码）
     */
    getPagePerObject: function(projectName, pageName) {
        var pagesHash = panUtil.swap('pagesHash') || {};
        try {
            var ret = compiler.process(projectName, pagesHash[projectName][pageName].code);
            return {
                html: ret.html,
                modulesLess: panUtil.util.dedupe_array(ret.less),
                modulesJs: panUtil.util.dedupe_array(ret.js),
                path: pagesHash[projectName][pageName].path
            }
        } catch (error) {
            console.log('mcompiler try ...  projectName:' + projectName + ' ,pageName： ' + pageName);
            console.log(error);
            return null;
        }
    },
    getPage: function(projectName, moduleName) {
        var pagesHash = panUtil.swap('pagesHash') || {};
        if (pagesHash[projectName]) {
            return pagesHash[projectName][moduleName] || null;
        }
        return null;
    },
    getModule: function(projectName, moduleName) {
        var modulesHash = panUtil.swap('modulesHash') || {};
        if (modulesHash[projectName]) {
            return modulesHash[projectName][moduleName] || null;
        }
        return null;
    },
    getMoJS: function(projectName, moduleName) {
        var mojsHash = panUtil.swap('mojsHash') || {};
        if (mojsHash[projectName]) {
            return mojsHash[projectName][moduleName] || null;
        }
        return null;
    },
    loadLibJS: function(projectName) {
        if (projectName.charAt(0) == '_') {
            return;
        }
        var mojsHash = panUtil.swap('mojsHash') || {};
        if (!mojsHash[projectName]) {
            mojsHash[projectName] = {};
        }
        var jsDirs = panUtil.file.getAllDirsSync(pan.getFilePath(path.join('Sites',projectName), 'jslib'), ['_inc']);
        panUtil.util.each(jsDirs, function(dir) {
            var js = compiler._getModuleObject(dir, 'jslib', projectName);
            if (js) {
                mojsHash[projectName][js.name] = js.obj;
            }
        });

        panUtil.swap('mojsHash', mojsHash);
    },
    loadPage: function(projectName) {
        if (projectName.charAt(0) == '_') {
            return;
        }
        var pagesHash = panUtil.swap('pagesHash') || {};
        if (!pagesHash[projectName]) {
            pagesHash[projectName] = {};
        }
        var pageDirs = panUtil.file.getAllDirsSync(pan.getFilePath(path.join('Sites',projectName), 'pages'));
        var i = 0;
        var dir;
        while (dir = pageDirs[i++]) {
            var p = compiler._getModuleObject(dir, 'pages', projectName);
            if (p && p.obj.code) {
                pagesHash[projectName][p.name] = p.obj;
                continue;
            }
            pageDirs = pageDirs.concat(mfile.getAllDirsSync(dir));
        }

        panUtil.swap('pagesHash', pagesHash);
    },
    //遍历目录，获取目录模块列表
    loadModule: function(projectName) {
        if (projectName.charAt(0) == '_') {
            return;
        }
        var modulesHash = panUtil.swap('modulesHash') || {};
        if (!modulesHash[projectName]) {
            modulesHash[projectName] = {};
        }
        var files = mfile.getAllDirsSync(require('./help').getSiteFilePath(projectName,'modules'));
        var dir, i = 0;
        while (dir = files[i++]) {
            var p = compiler._getModuleObject(dir, 'modules', projectName);
            if (p) {
                modulesHash[projectName][p.name] = p.obj;
                continue;
            }
            files = files.concat(mfile.getAllDirsSync(dir));
        };
        panUtil.swap('modulesHash', modulesHash);
        return modulesHash;
    },
    /**
     * 根据目录，返回模块或页面对象
     * @method _getModuleObject
     * @param  {string}         dir         [description]
     * @param  {type}         type      mojs|pages|modules
     * @return {[type]}                     [description]
     */
    _getModuleObject: function(dir, type, projectName) {
        // // console.log(dir, dir.match(reg_module_pathinfo[type]));
        // var pathInfo = dir.match(reg_module_pathinfo[type]),
        //     modPath = pathInfo && pathInfo[1],
        //     modName = pathInfo && pathInfo[2];
        var modName = dir.match(/([^\/\\]+)[\/\\]?$/)[1];
        // if(!modName){
        //     debugger;
        // }
        var htmlpath = path.join(dir, modName + '.html');
        var lesspath = path.join(dir, modName + '.moca');
        var jspath = path.join(dir, modName + '.js');
        var hashtml = fs.existsSync(htmlpath);
        if (modName.charAt(0) == '_') {
            return 0;
        }
        var prjConfig = compiler.getProjectCfg(projectName);
        if (hashtml || type == 'jslib') {
            var ret = {
                name: modName,
                obj: {
                    path: dir
                }
            };

            if (hashtml) {
                ret.obj.code = '<!-- ' + type + ' : ' + modName + '.html' + ' -->\n' + fs.readFileSync(htmlpath, 'utf8').toString().replace(/<img([^\/>]+?)src=(["']?)([^>\s]+)\2/ig, function(itag, iattr, _c, ipath) {
                    var isrc;
                    if ((/^\/\/?|https?:\/\//).test(ipath)) {
                        isrc = ipath;
                    } else {
                        isrc = (prjConfig.cdn ? prjConfig.cdn : '') +
                            (ipath.charAt(0) == '~' ? ipath.substr(1) : ('/img/' + m_dir_hash[type] + '/' + modName + '/' + ipath));
                    }
                    return '<img' + iattr + 'src="' + isrc + '" ';
                });

                ret.obj.code_mtime = fs.statSync(htmlpath).mtime;
            } else {
                ret.obj.code = ''
                ret.obj.code_mtime = 0;
            }
            if (fs.existsSync(jspath)) {
                ret.obj.js = fs.readFileSync(jspath, 'utf8').toString();
                ret.obj.js_require = (function() {
                    var req = [];
                    // console.log('bout');
                    ret.obj.js.replace(/@require\s(\S+)/g, function(a, b) {
                        var as = b.split(',');
                        panUtil.util.each(as, function(v) {
                            if (v.trim()) {
                                req.push(v.trim());
                            }
                        });
                        return a;
                    });
                    return req;
                }());
                ret.obj.js_mtime = fs.statSync(jspath).mtime;
            } else {
                ret.obj.js = ''
                ret.obj.js_mtime = 0;
            }
            if (fs.existsSync(lesspath)) {
                var lessCode = fs.readFileSync(lesspath, 'utf8').toString();
                lessCode = lessCode.replace(/(url|_img)\([\"\']?(?!http)(?!\~)([^\'\"@]*?)[\'\"]?\s*?(\)|\,)/g, function(str, a, imgpath, c) {
                    return a + '("' + (prjConfig.imgCdn ? prjConfig.imgCdn : (prjConfig.cdn ? prjConfig.cdn : '')) + '/img/' + m_dir_hash[type] + '/' + modName + '/' + imgpath + '"' + c;
                });
                ret.obj.less = lessCode;
                ret.obj.less_mtime = fs.statSync(lesspath).mtime;
            } else {
                ret.obj.less = ''
                ret.obj.less_mtime = 0;
            }
            return ret;
        } else {
            console.log('_getModuleObject: file: ' + htmlpath + ' is miss');
            return null;
        }
    },
    // _processLessResource:function(){

    // },
    //解析module
    processModule: function(projectName, moduleName) {
        var modulesHash = panUtil.swap('modulesHash');
        var js = [moduleName],
            less = [moduleName],
            mod, code;

        mod = compiler.getModule(projectName, moduleName);
        if (!mod) {
            console.log('未找到模块:' + moduleName + '！');
            return null;
        }

        code = mod.code;
        if (reg_module.test(mod.code)) {
            //如果模块引用了模块，则解析内部的模块
            var cinfo = compiler.process(projectName, mod.code);
            code = cinfo.html;
            js = js.concat(cinfo.js);
            less = less.concat(cinfo.less);
        }
        return {
            code: code,
            less: less,
            js: js
        };
    },
    /**
     * 获取图片
     * @method getImage
     * @param  {string} projectName 项目名称
     * @param  {string} type       page|modules|mojs
     * @param  {string} mod         页面名称，模块名称或JS组件名称
     * @param  {string} imgName     图片名称
     * @return {object} {path:imgpath}
     */
    getImage: function(projectName, type, name, imgName) {
        var imgpath = '';
        if (type === 'page') {
            imgpath = path.join(panUtil.swap('pagesHash')[projectName][name].path, imgName)
        } else if (type === 'modules') {
            imgpath = path.join(panUtil.swap('modulesHash')[projectName][name].path, imgName)
        } else {
            imgpath = require('./help').getSiteFilePath(projectName, 'jslib', name, name, imgName);
        }
        return {
            path: imgpath
        }
    }
};

module.exports = compiler;