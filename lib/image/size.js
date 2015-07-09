var pan = require('pandorajs'),
    panUtils = require('pan-utils'),    
    fs = require('fs'),
    path = require('path'),
    mfile = panUtils.file,
    mutil = panUtils.util,
    // 图片处理模块images基于CC++开发,需要跟进不同平台编译.根据windows和非windows环境,biuild了两个模块
    images = require('images'),
    crypto = require('crypto');

var size = {
    /**
     * 以原图地址获取，不错在则用2x图创建,会判断文件是否修改
     *
     * @method getImg
     * @param  {[type]}   filePath 原图地址
     * @param  {Function} callback 回调
     */
    getImg: function(projectName, filePath, callback) {
        var imgType = path.extname(filePath),
            imgName = path.basename(filePath, imgType),
            originalImgName =  imgName + (/2x$/.test(imgName)?'':'2x');
        originalImgPath = path.join(path.dirname(filePath), originalImgName + imgType);
        if (!fs.existsSync(filePath)) {

            //图不存在时
            if (fs.existsSync(originalImgPath)) {
                this.copyHelfImg(originalImgPath, callback);
            } else {
                callback(null);
            }
        } else {
            //图片存在，但是没2x图则直接输出
            if (!fs.existsSync(originalImgPath)) {
                callback(filePath);
                return;
            }

            var jsonDir = require('../help').getSiteFilePath(projectName, 'json'),
                imgJsonFile = path.join(jsonDir, 'img-size.json'),
                jsonImgConf = {};

            if (fs.existsSync(imgJsonFile)) {
                jsonImgConf = fs.readFileSync(imgJsonFile, 'utf8').toString(), //读取img.json配置
                jsonImgConf = !mutil.isEmptyObject(jsonImgConf) ? JSON.parse(jsonImgConf) : {};
                //md5图片对比	
            } else {
                mfile.createFileSync(imgJsonFile);
            }
            //2倍图MD5
            var imgbuf = fs.readFileSync(originalImgPath);
            var imgmd5 = crypto.createHash('md5').update(imgbuf).digest('hex');
            if (jsonImgConf[originalImgPath] && jsonImgConf[originalImgPath] == imgmd5) {
                callback(filePath);
            } else {
                this.copyHelfImg(originalImgPath, function(file) {

                    jsonImgConf[originalImgPath] = imgmd5;
                    jsonImgConf = JSON.stringify(jsonImgConf);
                    //写入json配置
                    fs.writeFileSync(imgJsonFile, jsonImgConf, 'utf8');
                    callback(file);
                });

            }
        }


    },

    /**
     * 创建原图一半的图片
     * @method copyHelfImg
     * @param  {[type]}    filePath 图片路径
     * @param  {Function}  callback 回调
     */
    copyHelfImg: function(filePath, callback) {

        var width = images(filePath).width() / 2,
            height = images(filePath).height() / 2,
            imgType = path.extname(filePath),
            imgName = path.basename(filePath, imgType),
            saveFileName = imgName.replace(/2x$/, ''),
            imaFile = path.dirname(filePath);
        saveFileD = path.join(imaFile, saveFileName + imgType);
        this.copyImgWithSize(filePath, saveFileD, width, height, callback);
    },

    /**
     * 以新尺寸创建图片
     * @method copyImgWithSize
     * @param  {[type]}        filePath 图片路径
     * @param  {[type]}        width    新图片宽度
     * @param  {[type]}        height   新图片高度
     * @param  {Function}      callback 回调
     */
    copyImgWithSize: function(filePath, saveFile, width, height, callback) {
        images(filePath).resize(width, height).save(saveFile);
        callback(saveFile);
    }

}

module.exports = size;