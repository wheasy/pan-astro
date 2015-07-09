/*
 * require:nodejs
 * author:wanhu
 * contact:wanhu88@gmail.com
*/
var fs = require('fs'),
    version = '1.0.5',
    filelist = [
        //'jquery\\jquery.js',
        'mo/mo.js',
//        'mo.req/mo.req.js',
        'lang/lang.js',
        'base/base.js',
        // 'loader/loader.js',
        'dom/dom.js',
        'node-attrs/node-attrs.js',
        'selector/selector.js',
        'event/event.js',
        'node-cls/node-cls.js',
        'node-core/node-core.js',
        'node-data/node-data.js',
        'node-event/node-event.js',
        'node-list/node-list.js',
        'node/node.js',
        'template/template.js',
        'widget/widget.js'
    ],
    mojs = '';
/**
 * 遍历文件,并合成一个
*/
function process (filelist,bywatch) {
    var file,i=0;
    while(file = filelist[i++]){
        /*
        if(!bywatch){
            fs.watchFile(file,function(){
                process(filelist,true);
            });
        }
        */
        //mojs += fs.readFileSync(__dirname+'\\'+version+'\\'+file,encoding='utf8') +' \n';
        mojs += fs.readFileSync(__dirname+'/'+file,encoding='utf8') +' \n';
    }
}
process(filelist);
fs.writeFile(require('path').join(require('path').dirname(__dirname),'js','mo.js'),mojs,encoding='utf8',function(e) {
    if (e) throw e;
    console.log('success:'+new Date());
})
