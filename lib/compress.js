/**
 * 合并压缩less和js
 */

var path = require('path'),
    fs = require("fs"),
    less = require('./less'),
    zlib = require('zlib'),
    crypto = require('crypto'), //md5
    dirname = path.dirname,
    pan = require('pandorajs'),
    panUtil = require('pan-utils'),
    sep = path.sep,
    child_process = require('child_process'),
    spawn = child_process.spawn,
    mfile = panUtil.file,
    mswap = panUtil.swap,
    reg_import = /@import *\"([a-z,A-z,\\,\/,\-]+)\";?/gi,
    reg_require = /Mo.require\(\s*['"]([^\d][a-z,A-Z,\,,\-,_,0-9]+)['"]/g,
    minify = require('html-minifier').minify,
    yuiCompressorPath = dirname(__dirname) + sep + 'tools' + sep + 'yuicompressor-2.4.8.jar';

//合并压缩less
function process_less_imports(projectName, lessCode, imported) {
        var imported = imported || {};
        if (!lessCode || !lessCode.replace) {
            return lessCode;
        }
        var importsCode = '';
        lessCode = lessCode.replace(reg_import, function(importstr, path) {
            if (imported[path]) {
                return '// *file:' + path + ' has been imported\n'
            }
            imported[path] = true;
            path = require('./help').getSiteFilePath(projectName, 'moca', path + '.moca');
            if (fs.existsSync(path)) {
                importsCode += '/* ' + path + ' */\n' + fs.readFileSync(path, 'utf8').toString() + '\n';
            } else {
                importsCode += '/* file:' + path + ' is miss*/\n'
            }
            return '/* ' + importstr + ' */';
        });
        lessCode = importsCode + lessCode;

        if (reg_import.test(lessCode)) {
            lessCode = process_less_imports(projectName, lessCode, imported);
        }
        return lessCode;
    }
    /**
     * 编译页面的LESS文件，返回CSS
     * @method parse_less
     * @param  {string}   projectName 项目名称
     * @param  {string}   pageName    页面名称
     * @param  {bool}   isCompress  是否压缩
     * @param  {Function} callback    回调函数，第一个函数参数为CSS CODE，第二个参数为lastMofidy time
     * @param  {bool}   isMoto  是否需要压缩driver和views的样式
     */
function parse_less(projectName, pageName, isCompress, callback, isMoto) {

    getPageRequiredJS({
        projectName: projectName,
        pageName: pageName,
        isModule: false,
        isCompress: isCompress,
        type: 'less',
        callback: function(code, lastModify) {
            callback(code, lastModify);
        },
        isMoto: isMoto
    });

}

function parse_module_less(projectName, pageName, callback) {
    getPageRequiredJS({
        projectName: projectName,
        pageName: pageName,
        isModule: true,
        type: 'less',
        callback: function(code, lastModify) {
            callback(code, lastModify);
        }
    });
}

function parse_js(cfg) {
    var projectName = cfg.projectName,
        pageName = cfg.pageName,
        isCompress = cfg.isCompress,
        callback = cfg.callback,
        isMoto = cfg.isMoto;

    var mc = require('./compiler');
    var pageInfo = mc.getPagePerObject(projectName, pageName);
    if (!pageInfo) {
        callback && callback('/* 没有匹配的页面信息 */', null);
        return;
    }

    return getPageRequiredJS({
        projectName: projectName,
        pageName: pageName,
        isModule: false,
        type: 'js',
        isPageJs: cfg.isPageJs,
        isCompress: isCompress,
        callback: function(code, lastModify) {
            callback && callback(code, lastModify);
        },
        isMoto: isMoto
    });
}

function parse_js_tpl(projectName) {
        var mc = require('./compiler');

        var prjCfg = mc.getProjectCfg(projectName);
        var tpl_str = fs.readFileSync(require('./help').getSiteFilePath(projectName, 'jslib', '_tpls', 'resources.js'), 'utf8').toString();
        var tpl_config = {};
        var fpath = '',
            i = 0;
        var tpath = require('./help').getSiteFilePath(projectName, 'jslib', '_tpls');
        var files = fs.readdirSync(tpath);
        while (fpath = files[i++]) {
            if (fpath == '.svn' || fpath == '.DS_Store') {
                continue;
            }
            if (!panUtil.util.isArray(fpath)) {
                fpath = [path.join(tpath, fpath), '']; //[全路径, 命名空间]
            }

            var tname = fpath[0].match(/([^\\\/\.]+)(\.html)?$/);

            if (fs.statSync(fpath[0]).isDirectory()) {
                panUtil.util.each(fs.readdirSync(fpath[0]), function(t) {
                    if (t == '.svn' || t == '.DS_Store') {
                        return;
                    }
                    files.push([
                        path.join(fpath[0], t),
                        fpath[1] ? fpath[1] + '.' + tname[0] : tname[0]
                    ]);
                });
                continue;
            }
            if (mfile.getExtName(fpath[0]) != 'html') {
                continue;
            }
            var fstr = fs.readFileSync(fpath[0], 'utf8').toString();
            fstr = fstr.replace(/(^\s+)|(\s+$)/gi, '').replace(/\s*\n\s*/g, '');

            tpl_config = panUtil.util.setObjValue(tpl_config, (fpath[1] ? fpath[1] + '.' : '') + tname[1], fstr);
        }
        return tpl_str.replace('__tpls__', JSON.stringify(tpl_config));
    }
    /**
     * 获取页面依赖的MOJS资源
     * @method getMoJSRequireDepend
     * @param  {Array}  reqs usagejs(业务JS)
     * @return {Array}  组件数组
     */
function getPageRequiredJS(cfg) {
    var mc = require('./compiler');

    var projectName = cfg.projectName,
        pageName = cfg.pageName,
        isModule = cfg.isModule,
        type = cfg.type,
        callback = cfg.callback,
        isMoto = cfg.isMoto,
        prjConfig = mc.getProjectCfg(projectName),
        isCombine = prjConfig.combine;

    var jsArray = [];

    if (isModule) {
        var module = mc.getModule(projectName, pageName);
        var modulesJs = [pageName];

        var modulesLess = mc.process(projectName, '<module:' + pageName + '/>').less;
    } else {
        var pageInfo = mc.getPagePerObject(projectName, pageName, isMoto);
        var pageObj = mc.getPage(projectName, pageName);
        var modulesJs = pageInfo ? pageInfo.modulesJs : [];
        var modulesLess = pageInfo ? pageInfo.modulesLess : [];
    }

    //只获取页面的JS
    if (!isCombine && cfg.isPageJs) {
        if (!pageInfo || !pageObj) {
            callback && callback('', -1);
            return;
        }
        callback && callback(pageObj.js, lastModify);
        return;
    }


    var motoLess;
    if (isMoto) {
        motoLess = getMotoLess(projectName);
        modulesLess = modulesLess.concat(motoLess.less);
        modulesLess = panUtil.util.dedupe_array(modulesLess);
    }
    var moUICore = {};
    var usageJS = '';
    var errorMSG = '';
    var requiredJS = [];
    var lastModify = 0;
    //种子已经包括在模块，不再加载
    panUtil.util.each('lang,loader,dom,node-attrs,selector,node-cls,event,node-core,node-data,node-event,node-list,node,template'.split(','), function(m) {
        moUICore[m] = true;
    });
    if (!pageInfo && !module) {
        callback('/*没有找到页面' + pageName + ' */', 0);
        return;
    }
    if (modulesJs) {
        //加载模块的JS
        panUtil.util.each(modulesJs, function(modname, index) {
            var mod = mc.getModule(projectName, modname);
            var mpath = path.join(mod.path, modname + '.js');
            if (!mod) {
                errorMSG += '/* 未找到模块 ' + modname + ':' + mpath + ' is miss*/\n';
                return;
            }
            if (mod.js) {
                //依赖的JS数组
                jsArray.push({
                    type: 'module',
                    name: modname
                });
                if (!isCombine) {
                    return;
                }

                if (lastModify < mod.js_mtime) {
                    lastModify = mod.js_mtime;
                }
                usageJS += '/*file[module]:' + mpath + ' */\n' + mod.js + '\n';
            } else {
                errorMSG += '/*file[module]:' + mpath + ' is miss*/\n';
            }
        });
    }
    //加载页面本身JS
    if (pageInfo) {
        var pmpath = path.join(pageInfo.path, pageName + '.js');
        if (pageObj.js) {
            if (lastModify < pageObj.js_mtime) {
                lastModify = pageObj.js_mtime;
            }
            if(pageObj.js.replace(/\/\/.+|\/\*[\s\S]*?\*\//ig, '').trim() != ''){
                //依赖的JS数组
                jsArray.push({
                    type: 'page',
                    name: pageName
                });
            }
            usageJS += '/*file[page]:' + pmpath + ' */\n' + pageObj.js + '\n';
        } else {
            errorMSG += '/*file[page]:' + pmpath + ' is miss*/\n';
        }
    }
    //没有引用JS
    if (!usageJS) {
        //
    }
    //处理依赖
    //处理Mo.require的形式
    usageJS.replace(reg_require, function(a, reqjs) {
        requiredJS = requiredJS.concat(reqjs.split(','));
    });
    //处理@require的形式
    if (!requiredJS.length) {
        usageJS.replace(/@require\s+(\S+)/g, function(a, reqjs) {
            requiredJS = requiredJS.concat(reqjs.split(','));
        });
    }
    //处理依赖 END
    //debugger
    if (requiredJS.length > 0) {
        //处理JS组件依赖关系
        requiredJS = (function(reqs) {
            var mods = require(path.join(require('./help').getSiteFilePath(projectName), 'config.js')).mojsDepends,
                jsQueue = reqs,
                t = [];
            //2.遍历组件列表,获取加载项
            var i = 0,
                j = jsQueue.length,
                r;
                // console.log('jsQueue-first',jsQueue);
            while (r = jsQueue[i++]) {
                if(i<=j){
                    t.push(r);
                }
                if (i > 1000) {
                    errorMSG += '/****** ' + requiredJS.join(',') + '\n依赖套嵌超过一千次，可能出现死循环***/\n';
                    break;
                }
                if (mods) {
                    if (mods[r]) {
                        if (mods[r]['require']) {
                            panUtil.util.each(mods[r]['require'], function(_r) {
                                if (!moUICore[_r]) {
                                    jsQueue.push(_r);
                                }
                            });
                        }
                    } else {
                        errorMSG += '/*js组件[moui]:' + jsQueue[i - 1] + ' is 未在mo.req中定义*/\n';
                    }
                } else {
                    var js_require = mc.getMoJS(projectName, r);
                    if (js_require) {
                        panUtil.util.each(js_require.js_require, function(_r) {
                            //debugger
                            if (!moUICore[_r]) {
                                jsQueue.push(_r);
                            }
                        });
                    } else {
                        errorMSG += '/*js组件[moui]:' + jsQueue[i - 1] + ' is 未找到 */\n';
                    }
                }
            }
            // console.log('t', t);
            // console.log('jsQueue', jsQueue);
            jsQueue = t.reverse().concat(jsQueue.slice(j));
            return panUtil.util.dedupe_array(jsQueue.reverse());
        }(requiredJS));
    }
    // console.log('abc',requiredJS);
    //依赖的JS数组
    var jsArray_t = []

    //遍历，合并所有的MOUI组件
    if (type == 'js') {
        panUtil.util.each(requiredJS, function(component) {
            if (!isCombine) {
                //引用的是js目录或第三方的
                if (/^(~|http:\/\/)/.test(component)) {
                    jsArray_t.push({
                        type: component.charAt(0) === '~' ? 'module' : 'third',
                        name: component
                    });
                    return;
                }
            }
            var jsmod = mc.getMoJS(projectName, component);
            if (!jsmod) {
                console.log('jslib----' + component + ' is miss');
                return;
            }
            jsArray_t.push({
                type: 'm',
                name: component
            });
            if (!isCombine) {
                return;
            }

            if (jsmod.js) {
                if (lastModify < jsmod.js_mtime) {
                    lastModify = jsmod.js_mtime;
                }
                errorMSG = errorMSG + '\n/* moui组件:' + jsmod.path + '/' + component + '.js */\n' + jsmod.js + '\n';
            } else {
                errorMSG += '/* moui组件:' + jsmod.path + '/' + component + '.js is missed */\n';
            }
        });

        if (isMoto) {
            usageJS = getMotoJs(projectName) + usageJS;
        }
        jsArray = jsArray_t.concat(jsArray);
        if (!isCombine) {
            return jsArray;
        }
        callback && callback(errorMSG + usageJS, lastModify);
    } else {
        errorMSG = '';
        lastModify = 0;
        var lessCode = '';

        // 组件的LESS
        panUtil.util.each(requiredJS, function(component) {
            var jsmod = mc.getMoJS(projectName, component);
            if (!jsmod) {
                errorMSG += '/*js组件 ' + component + ' 没有moca */\n';
                return;
            }
            if (jsmod.less) {
                if (lastModify < jsmod.less_mtime) {
                    lastModify = jsmod.less_mtime;
                }
                lessCode += '/* moui组件:' + jsmod.path + '/' + component + '.moca */\n' + jsmod.less + '\n';
            } else {
                errorMSG += '/* moui组件:' + jsmod.path + '/' + component + '.moca is missed */\n';
            }
        });


        // if (isMoto) {
        //     lessCode += getMotoLess(projectName);
        // }
        // 模块的LESS
        if (modulesLess.length > 0) {
            panUtil.util.each(modulesLess, function(modname, index) {
                var mod = mc.getModule(projectName, modname);
                if (!mod) {
                    console.log('module ----' + modname + ' is miss');
                    return;
                }
                if (mod.less) {
                    if (lastModify < mod.less_mtime) {
                        lastModify = mod.less_mtime;
                    }
                    lessCode += '/* ' + mod.path + '/' + modname + '.moca */\n' + mod.less + '\n';
                } else {
                    errorMSG += '/* ' + mod.path + '/' + modname + '.moca is miss*/\n';
                }
            });
        }
        //页面的LESS
        if (pageObj && pageObj.less) {
            if (pageObj.less) {
                if (lastModify < pageObj.less_mtime) {
                    lastModify = pageObj.less_mtime;
                }
                lessCode += '/* ' + pageObj.path + '/' + pageName + '.moca */\n' + pageObj.less + '\n';
            } else {
                errorMSG += '/* ' + pageObj.path + '/' + pageName + '.moca is miss*/\n';
            }
        }

        if (motoLess && motoLess.code) {
            lessCode += motoLess.code;
        }
        lessCode = process_less_imports(projectName, lessCode);
        //老的引用LESS的方式
        // new(less.Parser)().parse(errorMSG + lessCode, function(err, tree) {
        //     if (err) {
        //         callback('/* ' + JSON.stringify(err) + ' */\n\n input is :\n' + lessCode, lastModify);
        //     } else {
        //         try {
        //             var css = tree.toCSS({
        //                 compress: true
        //             });
        //老的引用LESS的方式 END
        less.render(errorMSG + lessCode, {
            compress: cfg.isCompress
        }, function(err, output) {
            if (err) {
                callback('/* ' + JSON.stringify(err) + ' */\n\n input is :\n' + lessCode, lastModify);
            } else {
                //替换less中~/img形式的图片地址为http://cdn/...或/...的形式
                //如果配置了imgCdn,则替换成/imgCdn/img/a.jpg的形式
                //否则替换成 http://cdn/img/a.jpg的形式
                var imgCdn  = (prjConfig.imgCdn ? prjConfig.imgCdn : (prjConfig.cdn ? prjConfig.cdn : ''));
                if(cfg.isCompress && fs.existsSync(require('./help').getSiteFilePath(projectName, 'json', 'sprite.json'))){
                    var spritJson = require(require('./help').getSiteFilePath(projectName, 'json', 'sprite.json'));
                    output.css = output.css.replace(/url\([\"\']?(?!http)~(.*?)[\'\"]?\)/g, function(str, imgpath) {
                        var v = imgpath.match(/([^?]+)(\?.*)/);
                        if(v){
                            imgpath = v[1];
                            v = v[2];
                        }else{
                            v = '';
                        }
                        var iInfo = spritJson['~'+imgpath];
                        if(iInfo){
                            imgpath = iInfo.path
                            return 'url(' + imgCdn + imgpath +v+ ') no-repeat ' + iInfo.pos;
                        }
                        return 'url(' + imgCdn + imgpath + ')';
                    });
                }
                output.css = output.css.replace(/url\([\"\']?(?!http)~(.*?)[\'\"]?\)/g, function(str, imgpath) {
                    return 'url(' + imgCdn + imgpath + ')';
                });
                callback(output.css, lastModify);
                // } catch (e) {
                //     callback('/* ' + JSON.stringify(e) + ' */\n\n input is :\n' + lessCode, lastModify);
                // }
            }
        });
    }
}

function getMotoLess(projectName) {
    var mc = require('./compiler');
    var lessCode = '';
    var htmlCode = '';
    var lessList = [];
    var type = {
            'views': 'v',
            'view-parts': 'd'
        }
        //获取driver和view的less
    var dirs = ['view-parts', 'views'];
    panUtil.util.each(dirs, function(dirName) {
        var fdir = mfile.getAllDirsSync(require('./help').getSiteFilePath(projectName, dirName));
        var i = 0;
        var dir;
        while (dir = fdir[i++]) {
            var modName = dir.match(/([^\/\\]+)[\/\\]?$/)[1];
            var lesspath = path.join(dir, modName + '.moca');
            var htmlpath = path.join(dir, modName + '.html');

            if (fs.existsSync(htmlpath)) {
                htmlCode += fs.readFileSync(htmlpath, 'utf8').toString();
            }
            if (fs.existsSync(lesspath)) {
                lessCode += '/* ' + dirName + '/' + modName + '.css*/\n' +
                    fs.readFileSync(lesspath, 'utf8').toString() + '\n';
                continue;
            }

            fdir = fdir.concat(mfile.getAllDirsSync(dir));
        }
    });
    lessList = mc.process(projectName, htmlCode).less;

    // lessCode = compress.process_less_imports(projectName, lessCode);
    return {
        code: lessCode,
        less: lessList
    };
}

function getMotoJs(projectName) {
    var mc = require('./compiler');

    var js_code = '';
    var type = {
        'views': 'v',
        'view-parts': 'd'
    }
    var dirs = ['view-parts', 'views'];
    panUtil.util.each(dirs, function(dirName) {
        var fdir = mfile.getAllDirsSync(require('./help').getSiteFilePath(projectName, dirName));
        var i = 0;
        var dir;
        while (dir = fdir[i++]) {
            var modName = dir.match(/([^\/\\]+)[\/\\]?$/)[1];
            var jspath = path.join(dir, modName + '.js');
            var htmlpath = path.join(dir, modName + '.html');

            if (fs.existsSync(htmlpath)) {
                var htmlCode = fs.readFileSync(htmlpath, 'utf8').toString();
                htmlCode = mc.process(projectName, htmlCode).html;

                htmlCode = require('./template').parse(htmlCode, {});

                if (!panUtil.util.isString(htmlCode)) {
                    console.log('getMotoJs 异常');
                    js_code += '/* ' + JSON.stringify(htmlCode) + ' */';
                    htmlCode = '';
                } else {
                    try {
                        htmlCode = JSON.stringify(minify(
                            htmlCode, {
                                collapseWhitespace: true,
                                removeComments: true
                            }));
                    } catch (error) {
                        htmlCode = '"<span style=\\"color:red;font-size:1.2rem\\">页面结构异常</span>:<pre style=\\"color:#dedede;\\">' + panUtil.util.replaceHtml(error).replace(/\n/g, '') + '</pre>"';
                    }
                    js_code += '/* ' + dirName + '/' + modName +
                        '.html*/\n Mt.setTpl(\'' + type[dirName] + '\',\'' + modName + '\',' + htmlCode.replace(/(<\w+.*?)(\smt[a-z,-]\w+.*?>)/ig, '$1 mt$2') + ')\n';
                }
            }
            if (fs.existsSync(jspath)) {
                js_code += '/* ' + dirName + '/' + modName +
                    '.js*/\n' + fs.readFileSync(jspath, 'utf8').toString() + '\n';
                continue;
            }
            fdir = fdir.concat(mfile.getAllDirsSync(dir));
        }
    });
    return js_code;
}
module.exports = {
    process_less_imports: process_less_imports,
    parse_less: parse_less,
    parse_js: parse_js,
    parse_js_tpl: parse_js_tpl,
    parse_module_less: parse_module_less
}