var pan = require('pandorajs');
var path= require('path');
var panUtil = require('pan-utils');
// var user = require('../../models/user_model.js');


module.exports = pan.page({
    attrs:{
        title:'项目首页'
    },
    // init:function(a){
    //     console.log('hoem');
            
    // },
    process:function(req, response){
       var prjName = this.get('params').prjname;
        // this.data['list2'] = ['a','b','c'];
        // debugger
        // response.$write(JSON.stringify(pagesHash[prjName]), true);
        this.data['projectname'] = prjName;
        if(!panUtil.swap('pagesHash')){
            response.$write('该项目不存在', true);
            return;
        }
        var pagelist = (panUtil.swap('pagesHash') || {})[prjName]|| {};
        var pa = [];
        for(var name in pagelist){
            pa.push(name);
        }
        pa.sort();

        this.data['pagelist'] = pa;

        var modulelist = (panUtil.swap('modulesHash') || {})[prjName]|| {};
        var ma = [];
        for(var name in modulelist){
            ma.push(name);
        }
        ma.sort();
        this.data['modulelist'] = ma;
        try{
            this.data['prjCfg'] = require(path.join(pan.root,'Sites', prjName,'config'));
        }catch(error){}
        console.log(this.get('params'));
        this.render();
    }
});