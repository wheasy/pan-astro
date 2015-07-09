Mo.define('moto-resource', function(M) {
    var moto = Mt;
    var L = M.Lang;

    window.$rebot_res = window.$rebot_res || {};
    moto.setTpl = function(type, name, value) {
        L.setObjValue($rebot_res, ['tpl', type, name].join('.'), value);
    }
    moto.getTpl = function(type, name, cbl) {
        var tpl = L.getObjValue($rebot_res, ['tpl', type, name].join('.'));
        if (cbl) {
            return cbl(tpl);
        } else {
            return tpl;
        }
    }
    /*
    var localstorage = M.localStorage;
    var Res_Cache = {
            tpl: {},
            js: {}
        },
        resType_ext = {
            tpl: 'html',
            js: 'js'
        };
    var res_io = {
        driver: 'view-parts',
        view: 'views'
    };

    var prefix = '$moto_res_';
*/
    /**
     * 获取资源
     * @method getResource
     * @param  {enum}    modType    模块类型，view或deiver
     * @param  {enum}    resType    资源类型，css,js,或tpl
     * @param  {stirng}    rname    资源名称
     * @param  {function}    cbl    回调函数
     */
    // function getResource(modType, resType, rname, version, cbl) {
    //     switch (resType) {
    //         case 'js':
    //             M.xPost({
    //                 url: '',
    //                 on: {
    //                     success: function() {}
    //                 }
    //             });
    //             break;
    //         case 'html':
    //             break;
    //         case 'css':
    //             break;
    //         default:
    //     }
    //     var resKey = [modType, resType, rname].join('.');
    // res_io[modType] + '/' + rname + '/' + rname + '.' + resType_ext[resType]
    // }
    // moto.getScript = function(modType, name, cbl) {
    //     getResource(modType, 'js', name, cbl);
    // };

    // moto.getTpl = function(modType, name, cbl) {
    //     getResource(modType, 'tpl', name, cbl);
    // };
/*
    (function() {
        //未加载过，则全部重新加载
        if (!localstorage.getItem('$moto_cached')) {
            // 
        }
        // function getResource(modType, resType, rname, cbl)
        M.each($moto_version['view'], function(vname, vobj) {
            if (vobj.js) {
                getResource('view', 'js', vname, function() {

                });
            }
            if (vobj.css) {
                getResource('view', 'css', vname, function() {

                });
            }
        });

        // $moto_version['driver']
        // $moto_version['css']
    }());
*/
});