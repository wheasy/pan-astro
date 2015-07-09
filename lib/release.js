var pan = require('pandorajs'),
    panUtil = require('pan-utils'),
    http = require('http'),
    fs = require('fs'),
    mfile = panUtil.file,
    mutil = panUtil.util,
    shelp = require('./help'),
    compress = require('./compress'),
    path = require('path'),
    sep = path.sep,
    M_TYPE = ['p', 'm', 'mj'],
    reg_pages = /\/pages\/(.*)\/img\/(.*)$/,
    reg_modules = /\/modules\/(.*)\/img\/(.*)$/,
    reg_mojs = /\/libjs\/(.*)\/img\/(.*)$/,
    reg_img = /\/img\/(.*?)([^\\\/\.]+\.\w+)$/,
    reg_js = /\/js\/(.*?)([^\\\/\.]+\.\w+)$/,
    app_cfg = pan.config.get('app_config'),

    /*reg_pages = /\/pages\/(.*)\/img\/(.*)$/,
    reg_modules = /\/modules\/(.*)\/img\/(.*)$/,
    reg_mojs = /\/mojs\/(.*)\/img\/(.*)$/,
    reg_img = /[\/\\]img[\/\\](.*?)([^\\\/\.]+\.\w+)$/,
    reg_js = /\/js\/(.*?)([^\\\/\.]+\.\w+)$/,*/
    imgExt = ['.jpg', '.png', '.gif', '.ttf', '.svg', '.eot', '.woff'],
    imgSmushitExt = ['.jpg', '.png', '.gif'],
    jsExt = ['.js'],
    crypto = require('crypto'), //md5
    compiler = require('./compiler'),
    smushit = require('node-smushit'),
    uglifyJs = require('uglify-js'),
    robot = require('./moto');
var release = {
    dealImageNew: function(projectName, type) {
        if (!mutil.in_array(type, M_TYPE)) return;
        //加载页面
        compiler.loadPage(projectName);
        compiler.loadModule(projectName);
        compiler.loadLibJS(projectName);

        var pagesHash,
            releaseDir = shelp.getSiteFilePath(projectName, 'release'),
            releaseImgDir = path.join(releaseDir, 'img', type);

        if (type == 'p') {
            pagesHash = panUtil.swap('pagesHash') || {};
        } else if (type == 'm') {
            pagesHash = panUtil.swap('modulesHash') || {};
        } else {
            pagesHash = panUtil.swap('mojsHash') || {};
        }
        if (!mutil.isEmptyObject(pagesHash[projectName])) {
            mutil.each(pagesHash[projectName], function(page, index) {
                var files = mfile.getAllFilesSync(page.path),
                    pageName = index;
                if (files.length) {
                    mutil.each(files, function(file, index) {
                        var fileExt = path.extname(file),
                            imgName = path.basename(file);
                        if (mutil.in_array(fileExt, imgExt)) { //文件为图片
                            var imgDirName = path.join(releaseImgDir, pageName, imgName);
                            var imgbuf = fs.readFileSync(file); //同步读原图
                            mfile.createFileSync(imgDirName); //先生成文件
                            fs.writeFileSync(imgDirName, imgbuf); //同步写
                            if (false) {
                                if (mutil.in_array(fileExt, imgSmushitExt)) {
                                    smushit.smushit(imgDirName); //压图
                                }
                            }
                        }
                    });
                }
            });
        }
    },
    dealImage: function(projectName, type) {
        if (!mutil.in_array(type, M_TYPE)) return;
        var releaseDir = shelp.getSiteFilePath(projectName, 'release'),
            releaseImgDir = path.join(releaseDir, 'img', type),
            jsonDir = shelp.getSiteFilePath(projectName, 'json'),
            imgJsonFile = path.join(jsonDir, 'img.json'),
            jsonImgConf = {},
            dealDir, reg,
            isMd5 = 0; //打开MD5文件
        if (isMd5) {
            if (fs.existsSync(imgJsonFile)) {
                jsonImgConf = fs.readFileSync(imgJsonFile, 'utf8').toString(), //读取img.json配置
                    jsonImgConf = !mutil.isEmptyObject(jsonImgConf) ? JSON.parse(jsonImgConf) : {};
            }
        }
        if (type == 'p') {
            dealDir = shelp.getSiteFilePath(projectName, 'pages'),
                reg = reg_pages;
        } else if (type == 'm') {
            dealDir = shelp.getSiteFilePath(projectName, 'modules'),
                reg = reg_modules;
        } else {
            dealDir = shelp.getSiteFilePath(projectName, 'mojs'),
                reg = reg_mojs;
        }
        var files = mfile.getAllFilesSync(dealDir); //取出目录下所有文件
        //console.log(files);return;
        if (files.length) {
            mutil.each(files, function(file, index) {
                var fileExt = path.extname(file);
                if (mutil.in_array(fileExt, imgExt)) { //文件为图片
                    var fileObj = file.match(reg);
                    if (!fileObj) return;
                    var dirName = fileObj[1],
                        imgName = fileObj[2],
                        imgObjKey = path.join(sep, 'img', type, dirName, imgName),
                        imgDirName = path.join(releaseImgDir, dirName, imgName), //发布图片地址
                        imgObj = {},
                        imgbuf, imgmd5, imgReleaseBuf, imgReleasemd5;
                    if (fs.existsSync(imgDirName)) {
                        imgReleaseBuf = fs.readFileSync(imgDirName); //同步读上线的文件
                        imgReleasemd5 = crypto.createHash('md5').update(imgReleaseBuf).digest('hex');
                        imgbuf = fs.readFileSync(file); //同步读原图
                        imgmd5 = crypto.createHash('md5').update(imgbuf).digest('hex'); //获取图片MD5
                        if (imgReleasemd5 != imgmd5) { //md5不一样，图片被修改
                            if (isMd5) {
                                newName = path.join(releaseImgDir, imgmd5 + fileExt); //生成要上线的文件
                                fs.writeFileSync(newName, imgbuf); //同步写
                                if (mutil.in_array(fileExt, imgSmushitExt)) {
                                    smushit.smushit(newName); //压图
                                }
                                imgObj = jsonImgConf[imgObjKey] ? jsonImgConf[imgObjKey] : imgObj;
                                imgObj['name'] = imgmd5;
                                imgObj['path'] = path.join(sep, 'img', type, imgmd5 + fileExt);
                                jsonImgConf[imgObjKey] = imgObj;
                            }
                            fs.writeFileSync(imgDirName, imgbuf); //同步写
                        }
                    } else {
                        imgbuf = fs.readFileSync(file); //同步读原图
                        mfile.createFileSync(imgDirName); //先生成文件
                        if (isMd5) {
                            imgmd5 = crypto.createHash('md5').update(imgbuf).digest('hex'); //获取图片MD5
                            newName = path.join(releaseImgDir, imgmd5 + fileExt); //生成要上线的文件
                            fs.writeFileSync(newName, imgbuf); //同步写
                            //smushit.smushit(newName);//压图
                            if (mutil.in_array(fileExt, imgSmushitExt)) {
                                smushit.smushit(newName); //压图
                            }
                            imgObj = jsonImgConf[imgObjKey] ? jsonImgConf[imgObjKey] : imgObj;
                            imgObj['name'] = imgmd5;
                            imgObj['path'] = path.join(sep, 'img', type, imgmd5 + fileExt);
                            jsonImgConf[imgObjKey] = imgObj;
                        }
                        fs.writeFileSync(imgDirName, imgbuf); //同步写                    
                    }
                }
            });
            if (isMd5) {
                jsonImgConf = JSON.stringify(jsonImgConf);
                //写入json配置
                fs.writeFileSync(imgJsonFile, jsonImgConf, 'utf8'); //生成文件
            }
        }
    },
    dealPageSimple: function(projectName) {
        //加载页面
        compiler.loadPage(projectName);
        compiler.loadModule(projectName);
        compiler.loadLibJS(projectName);
        var pagesHash = panUtil.swap('pagesHash') || {},
            releaseDir = shelp.getSiteFilePath(projectName, 'release'),
            cssDir = path.join(releaseDir, 'css'),
            jsDir = path.join(releaseDir, 'js');

        if (!mutil.isEmptyObject(pagesHash[projectName])) {
            mutil.each(pagesHash[projectName], function(page, index) {
                var pageName = index;
                //合并压缩css
                compress.parse_less(projectName, pageName, true, function(css, time) {
                    if (time) {
                        var cssPage = path.join(cssDir, 'p', pageName + '.css');
                        mfile.createFileSync(cssPage); //先生成文件
                        fs.writeFileSync(cssPage, css, 'utf8'); //生成文件
                    }
                });
                //合并压缩js
                compress.parse_js({
                    projectName: projectName,
                    pageName: pageName,
                    isCompress: true,
                    isPageJs: true,
                    callback: function(js, time) {
                        if (time) {
                            var jsPage = path.join(jsDir, 'p', pageName + '.js');
                            mfile.createFileSync(jsPage); //先生成文件  
                            fs.writeFileSync(jsPage, js, 'utf8'); //生成文件 
                            if (true) {
                            fs.writeFileSync(jsPage, uglifyJs.minify(jsPage).code, 'utf8'); //生成文件 

                                // yuicompressor.compress(jsPage, {
                                //     //Compressor Options:
                                //     charset: 'utf8',
                                //     type: 'js'
                                //         // nomunge: true,
                                //         // 'line-break': 80
                                // }, function(err, cjs, extra) {
                                //     //err   If compressor encounters an error, it's stderr will be here
                                //     //data  The compressed string, you write it out where you want it
                                //     //extra The stderr (warnings are printed here in case you want to echo them
                                //     if (!err) {
                                //         fs.writeFileSync(jsPage, cjs, 'utf8'); //生成文件 
                                //     } else {
                                //         console.log(extra);
                                //     }
                                // });
                            }
                        }
                    }
                });
            });
        }
    },
    dealPage: function(projectName) {
        //加载页面
        compiler.loadPage(projectName);
        compiler.loadModule(projectName);
        compiler.loadLibJS(projectName);
        var pagesHash = panUtil.swap('pagesHash') || {},
            releaseDir = shelp.getSiteFilePath(projectName, 'release'),
            jsonDir = shelp.getSiteFilePath(projectName, 'json'),
            confJsonFile = path.join(jsonDir, 'conf.json'),
            imgJsonFile = path.join(jsonDir, 'img.json'),
            cssDir = path.join(releaseDir, 'css'),
            jsDir = path.join(releaseDir, 'js'),
            jsonConf = jsonImgConf = {},
            isMd5 = 0;
        if (fs.existsSync(confJsonFile)) {
            jsonConf = fs.readFileSync(confJsonFile, 'utf8').toString(), //读取img.json配置
                jsonConf = !mutil.isEmptyObject(jsonConf) ? JSON.parse(jsonConf) : {};
        }
        if (isMd5) {
            if (fs.existsSync(imgJsonFile)) {
                jsonImgConf = fs.readFileSync(imgJsonFile, 'utf8').toString(), //读取img.json配置
                    jsonImgConf = !mutil.isEmptyObject(jsonImgConf) ? JSON.parse(jsonImgConf) : {};
            }
        }
        if (!mutil.isEmptyObject(pagesHash[projectName])) {
            mutil.each(pagesHash[projectName], function(page, index) {
                var pageName = index;
                //合并压缩css
                compress.parse_less(projectName, pageName, true, function(css, time) {
                    if (time) {
                        if (isMd5) {
                            //换成线上图片
                            css = css.replace(/url\([\"\']?(?!http)(~?)(.*?)[\'\"]?\)/g, function(str, isg, imgpath) {
                                if (jsonImgConf[imgpath]) return 'url(' + jsonImgConf[imgpath]['path'] + ')';
                            });
                        }
                        var cssName = crypto.createHash('md5').update(css).digest('hex');
                        cssName = cssName + '.css',
                            cssfile = path.join(cssDir, cssName);
                        var cssPage = path.join(cssDir, 'p', pageName + '.css');
                        //修改json文件
                        var pageObj = !mutil.isEmptyObject(jsonConf[pageName]) ? jsonConf[pageName] : {};
                        if (mutil.isEmptyObject(pageObj) || pageObj['css'] != cssName) { //判断page对象是否存在 不存在或与上一次文件不一致
                            if (isMd5) {
                                mfile.createFileSync(cssfile); //先生成文件
                                fs.writeFileSync(cssfile, css, 'utf8'); //生成文件
                            }
                            pageObj['css'] = cssName;
                            jsonConf[pageName] = pageObj;

                            mfile.createFileSync(cssPage); //先生成文件  
                            fs.writeFileSync(cssPage, css, 'utf8'); //生成文件           
                        }
                    }
                });
                //合并压缩js
                compress.parse_js({
                    projectName: projectName,
                    pageName: pageName,
                    isPageJs: true,
                    isCompress: true,
                    callback: function(js, time) {
                        if (time) {
                            var jsName = crypto.createHash('md5').update(js).digest('hex');
                            jsName = jsName + '.js',
                                jsfile = path.join(jsDir, jsName);

                            var jsPage = path.join(jsDir, 'p', pageName + '.js');
                            //修改json文件
                            jsonConf = jsonConf ? jsonConf : {};
                            var pageObj = !mutil.isEmptyObject(jsonConf[pageName]) ? jsonConf[pageName] : {};
                            if (mutil.isEmptyObject(pageObj) || pageObj['js'] != jsName) { //判断page对象是否存在 不存在或者上次修改时间小于修改时间
                                if (isMd5) {
                                    mfile.createFileSync(jsfile); //先生成文件
                                    fs.writeFileSync(jsfile, js, 'utf8'); //生成文件
                                }
                                pageObj['js'] = jsName;
                                jsonConf[pageName] = pageObj;

                                mfile.createFileSync(jsPage); //先生成文件  
                                fs.writeFileSync(jsPage, js, 'utf8'); //生成文件              
                            }
                        }
                    }
                });
            });
            jsonConf = JSON.stringify(jsonConf);
            //写入json配置
            fs.writeFileSync(confJsonFile, jsonConf, 'utf8'); //生成文件
        }
    },
    dealRoView: function(projectName) {
        //加载页面
        compiler.loadPage(projectName);
        compiler.loadModule(projectName);
        compiler.loadLibJS(projectName);
        var pagesHash = panUtil.swap('pagesHash') || {},
            releaseDir = shelp.getSiteFilePath(projectName, 'release'),
            jsonDir = shelp.getSiteFilePath(projectName, 'json'),
            confJsonFile = path.join(jsonDir, 'conf.json'),
            imgJsonFile = path.join(jsonDir, 'img.json'),
            cssDir = path.join(releaseDir, 'css'),
            jsDir = path.join(releaseDir, 'js'),
            jsonConf = jsonImgConf = {},
            isMd5 = 0;
        if (fs.existsSync(confJsonFile)) {
            jsonConf = fs.readFileSync(confJsonFile, 'utf8').toString(), //读取img.json配置
                jsonConf = !mutil.isEmptyObject(jsonConf) ? JSON.parse(jsonConf) : {};
        }
        if (isMd5) {
            if (fs.existsSync(imgJsonFile)) {
                jsonImgConf = fs.readFileSync(imgJsonFile, 'utf8').toString(), //读取img.json配置
                    jsonImgConf = !mutil.isEmptyObject(jsonImgConf) ? JSON.parse(jsonImgConf) : {};
            }
        }
        if (!mutil.isEmptyObject(pagesHash[projectName])) {
            mutil.each(pagesHash[projectName], function(page, index) {
                var pageName = index;
                //合并压缩css
                compress.parse_less(projectName, pageName, true, function(css, time) {
                    if (time) {
                        if (isMd5) {
                            //换成线上图片
                            css = css.replace(/url\([\"\']?(?!http)(~?)(.*?)[\'\"]?\)/g, function(str, isg, imgpath) {
                                if (jsonImgConf[imgpath]) return 'url(' + jsonImgConf[imgpath]['path'] + ')';
                            });
                        }
                        var cssName = crypto.createHash('md5').update(css).digest('hex');
                        cssName = cssName + '.css',
                            cssfile = path.join(cssDir, cssName);
                        var cssPage = path.join(cssDir, 'app', pageName + '.css');
                        //修改json文件
                        var pageObj = !mutil.isEmptyObject(jsonConf[pageName]) ? jsonConf[pageName] : {};
                        /*if(mutil.isEmptyObject(pageObj)||pageObj['css']!=cssName){//判断page对象是否存在 不存在或与上一次文件不一致
                            if(isMd5){
                                mfile.createFileSync(cssfile);//先生成文件
                                fs.writeFileSync(cssfile, css, 'utf8'); //生成文件
                            }
                            pageObj['css'] = cssName;   
                            jsonConf[pageName] = pageObj;  

                            mfile.createFileSync(cssPage);//先生成文件  
                            fs.writeFileSync(cssPage, css, 'utf8'); //生成文件           
                        }*/
                        mfile.createFileSync(cssPage); //先生成文件  
                        fs.writeFileSync(cssPage, css, 'utf8'); //生成文件  
                    }
                }, true);
                //合并压缩js
                compress.parse_js({
                    projectName: projectName,
                    pageName: pageName,
                    isPageJs: true,
                    isCompress: true,
                    callback: function(js, time) {
                        if (time) {
                            var jsName = crypto.createHash('md5').update(js).digest('hex');
                            jsName = jsName + '.js',
                                jsfile = path.join(jsDir, jsName);

                            var jsPage = path.join(jsDir, 'app', pageName + '.js');
                            //修改json文件
                            jsonConf = jsonConf ? jsonConf : {};
                            var pageObj = !mutil.isEmptyObject(jsonConf[pageName]) ? jsonConf[pageName] : {};
                            /*if(mutil.isEmptyObject(pageObj)||pageObj['js']!=jsName){//判断page对象是否存在 不存在或者上次修改时间小于修改时间
                                if(isMd5){
                                    mfile.createFileSync(jsfile);//先生成文件
                                    fs.writeFileSync(jsfile, js, 'utf8'); //生成文件
                                }
                                pageObj['js'] = jsName; 
                                jsonConf[pageName] = pageObj; 

                                mfile.createFileSync(jsPage);//先生成文件  
                                fs.writeFileSync(jsPage, js, 'utf8'); //生成文件              
                            }*/
                            mfile.createFileSync(jsPage); //先生成文件
                            fs.writeFileSync(jsPage, js, 'utf8'); //生成文件 
                            if (true) {
                                fs.writeFileSync(jsPage, uglifyJs.minify(jsPage).code, 'utf8'); //生成文件 

                                // yuicompressor.compress(jsPage, {
                                //     //Compressor Options:
                                //     charset: 'utf8',
                                //     type: 'js'
                                //         // nomunge: true,
                                //         // 'line-break': 80
                                // }, function(err, cjs, extra) {
                                //     //err   If compressor encounters an error, it's stderr will be here
                                //     //data  The compressed string, you write it out where you want it
                                //     //extra The stderr (warnings are printed here in case you want to echo them
                                //     if (!err) {
                                //         fs.writeFileSync(jsPage, cjs, 'utf8'); //生成文件 
                                //     } else {
                                //         console.log(extra);
                                //     }
                                // });
                            }
                        }
                    },
                    isRobot: true
                });
            });
            /*jsonConf = JSON.stringify(jsonConf);
            //写入json配置
            fs.writeFileSync(confJsonFile, jsonConf, 'utf8'); //生成文件*/
            var seedjs = robot.getRobotSeedJs(projectName);
            var jsSeedfile = path.join(jsDir, 'mo-single.js');
            mfile.createFileSync(jsSeedfile); //先生成文件
            fs.writeFileSync(jsSeedfile, seedjs, 'utf8'); //生成文件 
            if (true) {
                fs.writeFileSync(jsSeedfile, uglifyJs.minify(jsSeedfile).code, 'utf8'); //生成文件 

                // yuicompressor.compress(jsSeedfile, {
                //     //Compressor Options:
                //     charset: 'utf8',
                //     type: 'js'
                //         // nomunge: true,
                //         // 'line-break': 80
                // }, function(err, cjs, extra) {
                //     //err   If compressor encounters an error, it's stderr will be here
                //     //data  The compressed string, you write it out where you want it
                //     //extra The stderr (warnings are printed here in case you want to echo them
                //     if (!err) {
                //         fs.writeFileSync(jsSeedfile, cjs, 'utf8'); //生成文件 
                //     } else {
                //         console.log(extra);
                //     }
                // });
            }
        }

    },
    dealCommonImg: function(projectName) {
        var releaseDir = shelp.getSiteFilePath(projectName, 'release'),
            imgDir = shelp.getSiteFilePath(projectName, 'img'),
            releaseImgDir = path.join(releaseDir, 'img'),
            jsonDir = shelp.getSiteFilePath(projectName, 'json'),
            imgJsonFile = path.join(jsonDir, 'img.json'),
            jsonImgConf = {},
            isMd5 = 0; //打开MD5文件
        if (isMd5) {
            if (fs.existsSync(imgJsonFile)) {
                jsonImgConf = fs.readFileSync(imgJsonFile, 'utf8').toString(), //读取img.json配置
                    jsonImgConf = !mutil.isEmptyObject(jsonImgConf) ? JSON.parse(jsonImgConf) : {};
            }
        }
        var imgfiles = mfile.getAllFilesSync(imgDir); //取出目录下所有文件
        console.log(imgfiles);
        if (imgfiles.length) {
            mutil.each(imgfiles, function(imgfile, index) {
                var fileExt = path.extname(imgfile);
                if (mutil.in_array(fileExt, imgExt)) { //文件为图片
                    var fileObj = imgfile.match(reg_img);
                    if (!fileObj) return;
                    var imgObjKey = fileObj[0],
                        imgPath = fileObj[1],
                        imgName = fileObj[2],
                        imgDirName = path.join(releaseDir, imgObjKey), //发布图片地址
                        imgObj = {},
                        imgbuf, imgmd5, imgReleaseBuf, imgReleasemd5;
                    if (fs.existsSync(imgDirName)) {
                        imgReleaseBuf = fs.readFileSync(imgDirName); //同步读上线的文件
                        imgReleasemd5 = crypto.createHash('md5').update(imgReleaseBuf).digest('hex');
                        imgbuf = fs.readFileSync(imgfile); //同步读原图
                        imgmd5 = crypto.createHash('md5').update(imgbuf).digest('hex'); //获取图片MD5
                        if (imgReleasemd5 != imgmd5) { //md5不一样，图片被修改
                            if (isMd5) {
                                newName = path.join(releaseImgDir, imgPath, imgmd5 + fileExt); //生成要上线的文件
                                fs.writeFileSync(newName, imgbuf); //同步写
                                if (mutil.in_array(fileExt, imgSmushitExt)) {
                                    smushit.smushit(newName); //压图
                                }
                                imgObj = jsonImgConf[imgObjKey] ? jsonImgConf[imgObjKey] : imgObj;
                                imgObj['name'] = imgmd5;
                                imgObj['path'] = path.join(sep, 'img', imgPath, imgmd5 + fileExt);
                                jsonImgConf[imgObjKey] = imgObj;
                            }
                            console.log('imgDirName', imgDirName);
                            fs.writeFileSync(imgDirName, imgbuf); //同步写
                        }
                    } else {
                        imgbuf = fs.readFileSync(imgfile); //同步读原图
                        mfile.createFileSync(imgDirName); //先生成文件
                        if (isMd5) {
                            imgmd5 = crypto.createHash('md5').update(imgbuf).digest('hex'); //获取图片MD5
                            newName = path.join(releaseImgDir, imgPath, imgmd5 + fileExt); //生成要上线的文件
                            fs.writeFileSync(newName, imgbuf); //同步写
                            if (mutil.in_array(fileExt, imgSmushitExt)) {
                                smushit.smushit(newName); //压图
                            }
                            imgObj = jsonImgConf[imgObjKey] ? jsonImgConf[imgObjKey] : imgObj;
                            imgObj['name'] = imgmd5;
                            imgObj['path'] = path.join(sep, 'img', imgPath, imgmd5 + fileExt);
                            jsonImgConf[imgObjKey] = imgObj;
                        }
                        fs.writeFileSync(imgDirName, imgbuf); //同步写                    
                    }
                }
            });
            if (isMd5) {
                jsonImgConf = JSON.stringify(jsonImgConf);
                //写入json配置
                fs.writeFileSync(imgJsonFile, jsonImgConf, 'utf8'); //生成文件
            }
        }
    },
    dealCommonJs: function(projectName) {
        var releaseDir = shelp.getSiteFilePath(projectName, 'release'),
            releaseJsDir = path.join(releaseDir, 'js'),
            jsDir = shelp.getSiteFilePath(projectName, 'js'),
            jsonDir = shelp.getSiteFilePath(projectName, 'json'),
            confJsonFile = path.join(jsonDir, 'conf.json'),
            jsonConf = {},
            isMd5 = 0; //打开MD5文件
        if (isMd5) {
            if (fs.existsSync(confJsonFile)) {
                jsonConf = fs.readFileSync(confJsonFile, 'utf8').toString(), //读取conf.json配置
                    jsonConf = !mutil.isEmptyObject(jsonConf) ? JSON.parse(jsonConf) : {};
            }
        }
        var jsfiles = mfile.getAllFilesSync(jsDir); //取出目录下所有文件
        if (jsfiles.length) {
            mutil.each(jsfiles, function(jsfile, index) {
                var fileExt = path.extname(jsfile);
                if (mutil.in_array(fileExt, jsExt)) { //文件为js
                    var fileObj = jsfile.match(reg_js);
                    //console.log(fileObj);return
                    if (!fileObj) return;
                    var jsObjKey = fileObj[0],
                        jsPath = fileObj[1],
                        jsName = fileObj[2],
                        jsDirName = path.join(releaseDir, jsObjKey), //发布js地址
                        jsObj = {},
                        jsbuf, jsmd5, jsReleaseBuf, jsReleasemd5;

                    /*if(fs.existsSync(jsDirName)){
                        jsReleaseBuf = fs.readFileSync(jsDirName);//同步读上线的文件
                        jsReleasemd5 = crypto.createHash('md5').update(jsReleaseBuf).digest('hex');
                        jsbuf = fs.readFileSync(jsfile);//同步读原图
                        jsmd5 = crypto.createHash('md5').update(jsbuf).digest('hex');//获取图片MD5
                        if(jsReleasemd5!=jsmd5){//md5不一样，图片被修改
                            if(isMd5){
                                newName = path.join(releaseJsDir,jsPath,jsmd5 + fileExt);//生成要上线的文件
                                fs.writeFileSync(newName, jsbuf);//同步写
                                jsObj = jsonConf[jsObjKey]?jsonConf[jsObjKey]:jsObj;
                                jsObj['name'] = jsmd5;
                                jsObj['path'] = path.join(sep,'js',jsPath,jsmd5+fileExt);
                                jsonConf[jsObjKey] = jsObj;
                            }   
                            fs.writeFileSync(jsDirName, jsbuf);//同步写
                        }
                    }else{*/
                    jsbuf = fs.readFileSync(jsfile); //同步读原图
                    mfile.createFileSync(jsDirName); //先生成文件
                    if (isMd5) {
                        jsmd5 = crypto.createHash('md5').update(jsbuf).digest('hex'); //获取图片MD5
                        newName = path.join(releaseJsDir, jsPath, jsmd5 + fileExt); //生成要上线的文件
                        fs.writeFileSync(newName, jsbuf); //同步写
                        jsObj = jsonConf[jsObjKey] ? jsonConf[jsObjKey] : jsObj;
                        jsObj['name'] = jsmd5;
                        jsObj['path'] = path.join(sep, 'js', jsPath, jsmd5 + fileExt);
                        jsonConf[jsObjKey] = jsObj;
                    }
                    fs.writeFileSync(jsDirName, jsbuf); //同步写       
                    if (true) {
                        fs.writeFileSync(jsDirName, uglifyJs.minify(jsDirName).code, 'utf8'); //生成文件 

                        // yuicompressor.compress(jsDirName, {
                        //     //Compressor Options:
                        //     charset: 'utf8',
                        //     type: 'js'
                        //         // nomunge: true,
                        //         // 'line-break': 80
                        // }, function(err, cjs, extra) {
                        //     //err   If compressor encounters an error, it's stderr will be here
                        //     //data  The compressed string, you write it out where you want it
                        //     //extra The stderr (warnings are printed here in case you want to echo them
                        //     if (!err) {
                        //         fs.writeFileSync(jsDirName, cjs, 'utf8'); //生成文件 
                        //     } else {
                        //         console.log(extra);
                        //     }
                        // });
                    }
                    //}
                }
            });
            if (isMd5) {
                jsonConf = JSON.stringify(jsonConf);
                //写入json配置
                fs.writeFileSync(confJsonFile, jsonConf, 'utf8'); //生成文件
            }
        }
        //console.log(jsfiles);return
    },
    dealResourceJs: function(projectName) {
        var releaseDir = shelp.getSiteFilePath(projectName, 'release'),
            releaseJsDir = path.join(releaseDir, 'js'),
            releaseJsName = path.join(releaseJsDir, 'resource.js'),
            jsonDir = shelp.getSiteFilePath(projectName, 'json'),
            confJsonFile = path.join(jsonDir, 'conf.json'),
            jsonConf = {},
            isMd5 = 0, //打开MD5文件
            jsObj = {},
            jsmd5, jsReleaseBuf, jsReleasemd5,
            jsObjKey = '/js/resource.js';

        if (isMd5) {
            if (fs.existsSync(confJsonFile)) {
                jsonConf = fs.readFileSync(confJsonFile, 'utf8').toString(), //读取conf.json配置
                    jsonConf = !mutil.isEmptyObject(jsonConf) ? JSON.parse(jsonConf) : {};
            }
        }
        //var resourceJs = compress.parse_js_tpl(projectName,true);
        var resourceJs = compress.parse_js_tpl(projectName);

        if (fs.existsSync(releaseJsName)) {
            jsReleaseBuf = fs.readFileSync(releaseJsName); //同步读上线的文件
            jsReleasemd5 = crypto.createHash('md5').update(jsReleaseBuf).digest('hex');
            jsmd5 = crypto.createHash('md5').update(resourceJs).digest('hex'); //获取图片MD5
            if (jsReleasemd5 != jsmd5) { //md5不一样，被修改
                if (isMd5) {
                    newName = path.join(releaseJsDir, jsmd5 + '.js'); //生成要上线的文件
                    fs.writeFileSync(newName, resourceJs); //同步写
                    jsObj = jsonConf[jsObjKey] ? jsonConf[jsObjKey] : jsObj;
                    jsObj['name'] = jsmd5;
                    jsObj['path'] = path.join(sep, 'js', jsmd5 + '.js');
                    jsonConf[jsObjKey] = jsObj;
                }
                fs.writeFileSync(releaseJsName, resourceJs); //同步写
            }
        } else {
            mfile.createFileSync(releaseJsName); //先生成文件
            if (isMd5) {
                jsmd5 = crypto.createHash('md5').update(resourceJs).digest('hex'); //获取图片MD5
                newName = path.join(releaseJsDir, jsmd5 + '.js'); //生成要上线的文件
                fs.writeFileSync(newName, resourceJs); //同步写
                jsObj = jsonConf[jsObjKey] ? jsonConf[jsObjKey] : jsObj;
                jsObj['name'] = jsmd5;
                jsObj['path'] = path.join(sep, 'js', jsmd5 + '.js');
                jsonConf[jsObjKey] = jsObj;
            }
            fs.writeFileSync(releaseJsName, resourceJs); //同步写 
        }

        if (isMd5) {
            jsonConf = JSON.stringify(jsonConf);
            //写入json配置
            fs.writeFileSync(confJsonFile, jsonConf, 'utf8'); //生成文件
        }
    },
    dealHtml: function(projectName) {
        //加载页面
        compiler.loadPage(projectName);
        compiler.loadModule(projectName);
        compiler.loadLibJS(projectName);

        var app_cfg = mo.config.get('app_config');
        app_cfg.port = '8818',
            svr = require('svr');

        svr = svr(app_cfg);

        try {
            svr.start();
        } catch (err) {}

        var pagesHash = panUtil.swap('pagesHash') || {},
            releaseDir = shelp.getSiteFilePath(projectName, 'release'),
            htmlDir = path.join(releaseDir, 'html');

        if (!mutil.isEmptyObject(pagesHash[projectName])) {
            setTimeout(function() {
                mutil.each(pagesHash[projectName], function(page, index) {
                    var pageName = index;
                    getPageHtml('http://localhost:' + app_cfg.port +
                        '/' + projectName + '/' + pageName + '?publish=true',
                        function(res) {
                            mfile.createFileSync(path.join(htmlDir, pageName + '.html'));
                            fs.writeFileSync(path.join(htmlDir, pageName + '.html'), res, 'utf8'); //生成文件
                        });
                });
                // code
            }, 200)
        }
    },
    //type=single,common
    releaseProject: function(projectName, type) {
        if (type) {
            if (!mutil.in_array(type, ['common', 'single'])) return;
            switch (type) {
                case "single":
                    //优先处理图片,处理page样式时依赖img.conf
                    this.dealCommonImg(projectName);
                    //处理公共js
                    this.dealResourceJs(projectName);
                    //处理页面
                    this.dealRoView(projectName);
                    return
                case "common":
                    //优先处理图片,处理page样式时依赖img.conf
                    this.dealCommonImg(projectName);
                    this.dealImageNew(projectName, 'p');
                    this.dealImageNew(projectName, 'm');
                    this.dealImageNew(projectName, 'mj');
                    //处理公共js
                    this.dealCommonJs(projectName);
                    this.dealResourceJs(projectName);
                    //处理页面
                    this.dealPageSimple(projectName);
                    return
                default:
                    //优先处理图片,处理page样式时依赖img.conf
                    this.dealCommonImg(projectName);
                    //处理公共js
                    this.dealResourceJs(projectName);
                    //处理页面
                    this.dealRoView(projectName);
                    return
            }
        }
    }

};



function getPageHtml(url, callback) {
    console.log('url', url);
    var alldata = '';
    var req = http.get(url, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            alldata += chunk;
        });
        res.on('end', function() {
            callback(alldata);
        });
    });
    req.on('error', function(e) {
        console.log('url', url);
    });
}
module.exports = release;