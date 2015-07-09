var pan = require('pandorajs');
var http = require('http');
var querystring = require('querystring');
var defaultPostHeader;
var hosts = {
    '': {
        name: 'm.etaoshi.com',
        port: '80'
    }
};
//d_api

module.exports = pan.page({
    attrs: {
        type: 'json'
    },
    // init:function(a){
    //     console.log('hoem');

    // },
    process: function(require, response) {
        var params = this.get('params');
        var prjname = params.prjname;

        var host = hosts[params.source];
        var from = '/'+params.source;
        if(typeof hosts[params.source] == 'undefined'){
            host = hosts[''];
            from = '';
        }
    
        var data = null,
            method = require.method;
        //data = JSON.stringify(require.$params);
        defaultPostHeader = require.headers['content-type'] ;
        if(defaultPostHeader && defaultPostHeader.indexOf('application/json')>-1){
            data =  require.$params;
        }else{
            data = querystring.stringify(require.$params);
        }
        // require.headers.cookie
        // var url = "/d_api/Supplier/SupplierIndex".replace(require.url, '/d_api')
        //通过hosts正则排除
        var url = require.url.replace('/d_api' + from, '');
        req_api(url, data, require.headers.cookie, method, host, function(resData, cookie) {
            // response.setHeader("Content-Type","application/json; charset=utf-8");
            cookie.forEach(function (c, i) {
                cookie[i] = c.replace(/domain.*?;/gi,'');
            })
            if (cookie) {
                response.writeHead(200, {
                    'Set-Cookie': cookie,
                });
            }
            response.$write(resData, 'utf-8');
            response.end();
        });
    }
});



function req_api(url, data, cookie, method, host, callback) {
    var alldata = '';
    if (method === 'POST') {
        var options = {
            hostname: host.name,
            port: host.port,
            path: url,
            method: 'POST',
            headers: {
                'Content-Length': data.length,
                'Content-type': defaultPostHeader
            }
        };
        if (cookie) {
            options.headers.cookie = cookie;
        }
        var req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                alldata += chunk;
            });
            res.on('end', function() {
                callback(alldata, res.headers['set-cookie']);
            });
        });
        req.on('error', function(e) {
            console.log('problem with options: ' + options);
            console.log('problem with data: ' + data);
            console.log('problem with request: ' + e.message);
        });
        req.write(data + '\n');
        req.end();
    } else {
        var
            options = {
                hostname: host.name,
                port: host.port,
                path: url,
                headers: {}
            };
        if (cookie) {
            options.headers.cookie = cookie;
        }
        var req = http.get(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                alldata += chunk;
            });
            res.on('end', function() {
                callback(alldata);
            });
        });
        req.on('error', function(e) {
            console.log('problem with options: ' + options);
            console.log('problem with data: ' + data);
            console.log('problem with request: ' + e.message);
        });
    }
}