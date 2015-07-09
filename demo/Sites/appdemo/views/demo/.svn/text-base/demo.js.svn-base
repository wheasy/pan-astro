Mt.defineView('demo', function(scope, ele, params) {
	scope.alert = function(){
        scope.$confirm("aaa");
    };
    scope.header = {
        title: '这是一个Demo'
    };
    scope.list = [
        {
            name:'张君宝',
            party:'武当'
        },
        {
            name: '小龙女',
            nick: '神仙姐姐'
        },
        {
            name:'张天宝',
            party: '少林'
        }
    ];
    scope.$on('loaded',function(){return;
		var a = ele.one('[mt-click="alert"]');
		var b =a.getAttr('mt-click');
		debugger;
		// var self = ele.one('#touch');
		// // 防止滚动事件重复绑定
		// self.plug([    
		//     {
		//         fn:M.Plugin.MotoScroll
		//     }
		// ])
	})
});