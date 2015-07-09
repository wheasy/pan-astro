var pan = require('pandorajs'),
    fs = require('fs'),
    path = require('path'),
    compiler = require('pan-astro').compiler,
    panUtil = require('pan-utils');

var mime = pan.config.get('svr_config')['mime'];

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

function getSource(prjname, file, callback) {
    var ext = path.extname(file),
        ext = ext ? ext.slice(1) : 'unknown',
        contentType = mime[ext] || 'text/plain',
        sourceData = {};
    contentType += '; charset=utf-8';

    if ('jpg,jpeg,png,gif'.indexOf(ext) != -1) {
        var img = require('pan-img');
        img.size.getImg(prjname, file, function(filePath) {

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
    //文件不存在
    callback(get404Obj(contentType));
}
module.exports = pan.page({
    attrs: {
        type: null,
        title: 'less'
    },
    // init:function(a){
    //     //new 的时候调用
    // },

    process: function(req, res) {
        var temp = req.url.match(/\/([^/#?]*)\/.*?\/([^/#?]*)\/([^/#?]*)\/([^/#?]*)/i);
        var prjname = temp[1];
        var type = temp[2];
        var mname = temp[3];
        var imgname = temp[4];

        var p = compiler[type == 'p' ? 'getPage' : (type == 'mj' ? 'getMoJS' : 'getModule')](prjname, mname);

        if(!p){
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            console.log('404 文件:' + req.url );
            res.write("404 文件不存在\r\n This request URL " + req.url + " was not found on this server.");
            res.end();
            return;
        }
        getSource(prjname, path.join(p.path, 'img', imgname), function(rsData) {
            if (rsData.status == '404') {
                res.writeHead(404, {
                    'Content-Type': rsData.contentType
                });
                console.log('404 文件:' + req.url + ',' + path.join(p.path, 'img', imgname));
                res.write("404 文件不存在\r\n This request URL " + req.url + " was not found on this server.");
                res.end();
            } else {
                res.writeHead(200, {
                    'Content-Type': rsData.contentType
                });
                res.write(rsData.file, "binary");
                res.end();
            }
        });
    }
});