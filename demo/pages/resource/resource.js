var pan = require('pandorajs'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    panUtil = require('pan-utils'),
    astro = require('pan-astro'),
    mime = pan.config.get('svr_config')['mime'];

var headers = {
    "ttf": true,
    "eot": true,
    "otf": true,
    "woff": true,
    "svg": true
};

function readFile(file, contentType, callback) {
    fs.readFile(file, "binary", function(err, file) {
        if (err) {
            sourceData = {
                'status': '500',
                'contentType': contentType,
                'file': err
            };
        } else {
            sourceData = {
                'status': '200',
                'contentType': contentType,
                'file': file
            };
        }
        callback(sourceData);
    });

}

function get404Obj(contentType) {
    return {
        'status': '404',
        'contentType': contentType,
        'file': ''
    };
}

function getSource(prjName, file, callback) {
    var ext = path.extname(file),
        ext = ext ? ext.slice(1) : 'unknown',
        contentType = mime[ext] || 'text/plain',
        sourceData = {};
    contentType += '; charset=utf-8';
    if ('jpg,jpeg,png,gif'.indexOf(ext) != -1) {
        var img = astro.image;
        img.size.getImg(prjName, file, function(filePath) {

            if (!filePath) {
                callback(get404Obj(contentType));
                return;
            }
            fs.exists(filePath, function(es) {
                if (!es) {
                    //文件不存在
                    callback(get404Obj(contentType));
                } else {
                    readFile(filePath, contentType, callback);
                }
            })
        });
        return;
    }
    fs.exists(file, function(exists) {
        if (!exists) {
            //文件不存在
            sourceData = {
                'status': '404',
                'contentType': contentType,
                'file': ''
            };
            callback(sourceData);
        } else {
            fs.readFile(file, "binary", function(err, file) {
                if (err) {
                    sourceData = {
                        'status': '500',
                        'contentType': contentType,
                        'file': err
                    };
                } else {
                    sourceData = {
                        'status': '200',
                        'ext': ext,
                        'contentType': contentType,
                        'file': file
                    };
                }
                callback(sourceData);
            });
        }
    });
}

module.exports = pan.page({
    attrs: {
        type: null,
        title: ''
    },
    // init:function(a){
    //     //new 的时候调用
    // },

    process: function(req, res) {
        var pathname = url.parse(req.url).pathname;
        var prjName = this.get('params');
        prjName = prjName.prjname;
        getSource(prjName, astro.help.getSiteFilePath(pathname), function(rsData) {
            if (rsData.status == '404') {
                res.writeHead(404, {
                    'Content-Type': rsData.contentType
                });
                console.log('404 文件:' + pathname+'\n\t'+ astro.help.getSiteFilePath(pathname));
                res.write("404 文件不存在\r\n This request URL " + pathname + " was not found on this server.");
                res.end();
            } else if (rsData.status == '500') {
                res.writeHead(500, {
                    'Content-Type': rsData.contentType
                });
                console.log('500 错误:' + rsData.file);
                res.end();
            } else {
                var headerObj = {'Content-Type': rsData.contentType};
                //解决字体跨域问题
                if (headers[rsData['ext']]) {
                    headerObj['Access-Control-Allow-Origin'] = "*";
                }
                res.writeHead(200, headerObj);
                res.write(rsData.file, "binary");
                res.end();
            }
        });
    }
});