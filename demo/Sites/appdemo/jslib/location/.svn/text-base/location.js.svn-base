Mo.define('location', function(M) {
    /** 
      * @namespace M.Location
      */
    M.Location = {};

    var L = M.Lang;
    var lo = M.Location;

    M.extend(M.Location, /** @lends M.Location */{
        /**
         * 转换百度的坐标(从64位加密转位数字)
         * @ignore
         * @param  {Number} x 百度接口返回的需要加密的x
         * @param  {Number} y 百度接口返回的需要加密的y
         * @return {Object}   { lng:..., lat:.. }
         */
        convertBaiduXy: function(a, b) {
            isNaN(a) && (a = Fb(a), a = isNaN(a) ? 0 : a);
            L.isString(a) && (a = parseFloat(a));
            isNaN(b) && (b = Fb(b), b = isNaN(b) ? 0 : b);
            L.isString(b) && (b = parseFloat(b));
            return {
                lng: a,
                lat: b
            }
        },
        /**
         * 转换GPS坐标到百度坐标
         * @ignore
         * @param  {Number}   x:通过GPS获取的longitude  
         * @param  {Number}   y:通过GPS获取的latitude      
         * @param  {Function} callback 回调函数
         * @return {Object}   { lng:..., lat:.. }
         */
        convertGpsToBaidu: function(x, y, callback) {
            M.xPost({
                url: 'http://api.map.baidu.com/ag/coord/convert?from=0&to=4&x=' + x + '&y=' + y,
                cache: true,
                on: {
                    complete: function(data) {
                        callback(lo.convertBaiduXy(data.x, data.y));
                    }
                }
            })
        },
        /**
        * @callback posSuccess    
        * @param {object} posobj 经纬度对象
        * @param {Number} posobj.lng longitude
        * @param {Number} posobj.lat latitude
        */
        /**
        * @callback posFailure    
        * @param {string} errermsg 错误提示
        */
        /**
         * 获取当前位置经纬度，可获取百度经纬度
         * @static
         * @example
         * var location = M.Location;
         * location.getPosition(function(pos) {
         *    var lng = pos.lng,
         *        lat = pos.lat;
         *   
         *    console.log('lng:'+lng+'lat:'+lat);
         *    alert('lng:'+lng+'lat:'+lat);
         * }, 
         * function(err) {
         *    console.log(err);
         * },'baidu');
         *
         * @param {posSuccess} successCallback    成功回调函数
         * @param {posFailure} errorCallback  失败回调函数
         * @param {string} type 类型：默认为空,支持baidu
         */
        getPosition: function(successCallback,errorCallback,type){
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function success(value) {
                        var longitude = value.coords.longitude;
                        var latitude = value.coords.latitude;
                        if(type == 'baidu'){
                          lo.convertGpsToBaidu(longitude, latitude, successCallback);
                        }else{
                          successCallback({
                              lng: longitude,
                              lat: latitude
                          });
                        }
                    },
                    function error(error) {
                         switch(error.code){
                          case error.TIMEOUT :
                              errorCallback("连接超时请重试");
                              break;
                          case error.PERMISSION_DENIED :
                              errorCallback("您拒绝了使用共享位置");
                              break;
                          case error.POSITION_UNAVAILABLE :
                              errorCallback("抱歉，无法通过您的浏览器获取您的信息");
                              break;
                          default:
                              errorCallback("未知错误");
                              break;
                         }
                    }, 
                {
                    enableHighAccuracy: true,//表示是否启用高精确度模式，如果启用这种模式，浏览器在获取位置信息时可能需要耗费更多的时间
                    maximumAge: 1000, //表示浏览器重新获取位置信息的时间间隔
                    timeout: 5000 //表示浏览需要在指定的时间内获取位置信息，否则触发errorCallback。
                });
            }else{
                errorCallback("抱歉，无法通过您的浏览器获取您的信息");
            }
        },
        /**
         * 通过城市和地点获取百度经纬度
         * @static
         * @example
         * var ak = '83bbcbbf67c196d32f9f2d83f2259eb3',
         *     city = '北京',
         *     name = '大望路';
         * location.getPositionByBaidu(city,name,ak,function(pos){
         *    var lng = pos.lng,
         *        lat = pos.lat;            
         *    console.log('lng:'+lng+',lat:'+lat);
         * });
         *
         * @param {string} city  城市
         * @param {string} name  地区名
         * @param {string} ak  调取百度接口的ak
         * @param {Function} callback  回调函数
         * @param {Object} callback.positioobject { lng:..., lat:.. }
         */
        getPositionByBaidu: function(city,name,ak,callback){
            var c = city||1,
                n = name||'';
            M.xPost({
                //url: 'http://api.map.baidu.com/?qt=con&c='+c+'&wd='+n+'&rn=1&ie=utf-8&oue=1&fromproduct=jsapi&res=api',
                url: 'http://api.map.baidu.com/geocoder/v2/?output=json&address='+name+'&city='+city+'&ak='+ak,//baidu转换接口
                cache: true,
                on: {
                    complete: function(data) {
                        if (data.status===0){
                            var pos = {
                                lng: data.result.location.lng,
                                lat: data.result.location.lat
                            }
                        }
                        callback(pos);
                    }
                }
            })
        }
    });

    var Eb = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    function Fb(a) {
        var b = "",
            d, e, f = "",
            g, i = "",
            k = 0;
        g = /[^A-Za-z0-9\+\/\=]/g;
        if (!a || g.exec(a)) return a;
        a = a.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        do d = Eb.indexOf(a.charAt(k++)), e = Eb.indexOf(a.charAt(k++)), g = Eb.indexOf(a.charAt(k++)), i = Eb.indexOf(a.charAt(k++)), d = d << 2 | e >> 4, e = (e & 15) << 4 | g >> 2, f = (g & 3) << 6 | i, b += String.fromCharCode(d), 64 != g && (b += String.fromCharCode(e)), 64 != i && (b += String.fromCharCode(f)); while (k < a.length);
        return b
    }
});