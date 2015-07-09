Mo.define('moto-plug-back', function(M) {
    /** @lends M.Plugin.back */
    M.plugin('back',  {
        unInstance: true,
        attrs: {},
        events: {},
        /**
         * 单页App后退插件
         * @module Moto
         * @constructor M.Plugin.Back
         * @example
         *```
         * <span class="back" mt-plugin="back">
         *```
        */
        init: function() {
            var host = this.get('host');
            var scope = this.get('scope');
            host.addClass('moto-plug-back');
            host.on('click', function(evt) {
                var router = scope.$getTopScope().get('app').router;
                //scope.get('host').viewexit.exit(function(){
                    // debugger;
                router.back(localStorage.loginRefer ? -2 : -1,host.getAttr('back-url'));
                M.$Swap.isBack = true;
                localStorage.removeItem('loginRefer');
                // M.$Swap.loginRefer = null;
                //});
            });
        }
    });

});