/**
    弹窗提示
*/
Mo.define('confirm', function(M) {
    var instance = null;
    var confirm = {
        init : function(text,type,button,fn){
            if(instance){
                instance.destroy();
            }
            instance = this;
            this.create(text,type,button,fn);
        },
        destroy:function(){
            this.node.remove();
            M.mask.hide();
            instance = null;
        },
        create: function(text,type,button,fn){
            var html = M.Template.get('app.confirm')({text:text,type:type,button:button}),
                node = M.Node.create(html);
            var self = this;
            self.node = node;
            M.one('body').append(node);
            M.mask({click:false});
            node.role('ok').on('click',function(){
                if(fn && fn.ok){
                    fn.ok();
                }
                self.destroy();
            });
            if(node.role('cancel')){
                node.role('cancel').on('click',function(){
                    if(fn && fn.cancel){
                        fn.cancel();
                    }
                    self.destroy();
                });
            }
        }
    }
    /**
     * [a description]
     * @param  {String}   text [description]
     * @param  {Function} fn   [description]
     * @param  {String}   type 
     *         警告:doubt(默认值)  , 错误:error
     * @return {type}        [description]
     */
    Mt.hideConfirm = function(){
        instance && instance.destroy();
    }
    Mt.confirm = function (text,fn,type){
        var c = confirm.init(text,type||'error',true,fn);
        //var node = M.Template.get('aap.confirm')();
    };
    //type:doubt,error
    Mt.alert = function(text,fn,type){
        var c = confirm.init(text,type||'doubt',false,fn);
        //var node = M.Template.get('aap.confirm')();

    };
});