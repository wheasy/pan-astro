var pan = require('pandorajs');
// var user = require('../../models/user_model.js');


module.exports = pan.page({
    attrs:{
        title:'404'
    },
    // init:function(a){
    //     //new 的时候调用
    // },

    process:function(require, response){
        //新建
        this.render();
    }
});