/**
 * 封装event
 * @memberOf M
 * @class Event
 * @2013.6.28
 * @author: shenguozu
**/
Mo.define('event', function (M) {
    M.Event = function( event, currentTarget ){
        var e, t, f,
            self = this;

        if(!(M.instanceOf(self, M.Event))) {
            self = new M.Event(event)
        }


        self._type_ = "mEvent";

        if( event && typeof event == "object" && event.type ){

            self.originalEvent = e = event;

            for( var name in e )
                if( typeof e[name] != "function" )
                    self[ name ] = e[ name ];

            if( e.extraData )
                M.extend( self, e.extraData );

            self._target = self.srcElement = e.srcElement || (
                ( t = e.target ) && ( t.nodeType == 3 ? t.parentNode : t )
            );
            self.relatedTarget = e.relatedTarget || (
                ( t = e.fromElement ) && ( t === self.target ? e.toElement : t )
            );
			self.currentTarget = currentTarget ? currentTarget : M.one(self.currentTarget);
            if(M.Node) {
                if(self._target){
                    self.target = new M.Node( self._target );
                }
            }


            self.keyCode = self.which = e.keyCode || e.which;

            // Add which for click: 1 === left; 2 === middle; 3 === right
            if( !self.which && e.button !== undefined )
                self.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) );

            var doc = document.documentElement, body = document.body;

            self.pageX = e.pageX || (
                e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0)
            );

            self.pageY = e.pageY || (
                e.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0)
            );

            self.data;
        }

        self.timeStamp = new Date().getTime();
        self.type = self.type || event;
        return self;
    }

    M.extend(M.Event, /** * @lends M.Event*/{
        /**
         * 阻止浏览器默认方法
         */
        stopPropagation : function() {
             var e = this.originalEvent;
             e && ( e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true );
        },
        /**
         * 阻止事件冒泡
         */
        preventDefault : function() {
             var e = this.originalEvent;
             e && ( e.preventDefault ? e.preventDefault() : e.returnValue = false );
        },
        /**
         * 同时阻止浏览器默认方法，事件冒泡
         */
        halt: function(){
            this.stopPropagation();
            this.preventDefault();
        }

    });
});
