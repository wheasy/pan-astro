var pan = require('pandorajs');
var path = require('path');
var panUtil = require('pan-utils');

module.exports = pan.page({
    attrs: {
        title: '项目列表'
    },
    // init:function(a){
    //     //new 的时候调用
    // },

    process: function(request, response) {
        var prjObjs =  panUtil.swap('modulesHash');
        var prjList = [];
        for(var prjName in prjObjs){
            prjList.push([prjName, require(path.join(pan.root,'Sites', prjName,'config'))]);
        }
        this.data.list = prjList;
        this.render();
    }
});