var pan = require('pandorajs'),
    path = require('path');

module.exports = {
    getSiteFilePath:function(){
        var p = path.join.apply(this, arguments);
        return pan.getFilePath('Sites', p);
    }
}