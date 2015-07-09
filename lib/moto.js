var mo = require('pan-utils'),
    fs = require('fs'),
    // less = require('less'),
    mfile = mo.file,
    path = require('path');

var moMoto = {
    /**
     * 返回所有Moto的核心JS和Moto的JS组件
     * 配置文件在project目录下的config.js文种
     * @method getMotoSeedJs
     * @param  {String}       projectName 项目名称
     * @return {[type]}                   [description]
     */
    getMotoSeedJs: function(projectName) {
        var c = require('mocompiler');
        var mojsCfg = require(path.join(mo.file.getAbsolutePath(projectName), 'mojs', 'mo_config.js'));
        var filelist = mojsCfg.motojs;
        var mojs = '';
        var jsdir = path.join(mo.file.getAbsolutePath(projectName), 'mojs');

        function process(filelist, bywatch) {
            var file, i = 0;
            while (file = filelist[i++]) {
                if (fs.existsSync(path.join(jsdir, file))) {
                    mojs += fs.readFileSync(path.join(jsdir, file), 'utf8') + ' \n';
                }else{
                    console.log('getMotoSeedJs -->  '+path.join(jsdir, file)+' is miss');
                }
            }
        }
        process(filelist);
        return mojs;
    }
};

module.exports = moMoto;