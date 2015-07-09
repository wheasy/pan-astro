Mo.define('moto-scroll', function(M) {
	M.namespace('Plugin');

	var scroll = function(config) {

		var self = config.host;
        if(self.getData('iScroll')){
            return;
        }
        self.setData('iScroll', true);

        var top = self.get('scrollTop');
        self.touch('swipe', function(evt, data) {
            var scrollDom = self.getDOMNode();
            var tempTop = top;
            if (data['direction'] == 'down' || data['direction'] == 'up') {
                tempTop = top - data['y'];
                if (tempTop < 0) {
                    tempTop = 0;
                }
                if (tempTop > scrollDom.scrollHeight - scrollDom.clientHeight) {
                    tempTop = scrollDom.scrollHeight - scrollDom.clientHeight;
                }

                scrollDom.scrollTop = tempTop;
            };
            if (data['status'] == 'end') {
                top = tempTop;
            };
        }).touch('start', function(evt, data) {
            var scrollDom = self.getDOMNode();
            top = scrollDom.scrollTop;
        });
    };
	scroll.NAME = 'moto-scroll';
    scroll.NS = 'moto-scroll';
    M.Plugin.MotoScroll = scroll;
		

})