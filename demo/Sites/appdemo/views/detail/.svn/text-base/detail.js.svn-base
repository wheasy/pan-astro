Mt.defineView('detail', function(scope, ele, attrs) {
    var M = arguments[arguments.length - 1];
    scope.buy = function(e) {
        scope.$confirm("Are you sure to buy this product?", {
            ok: function() {

            }
        });
    };

    scope.$on('loaded_lazy',function(){
        ele.addClass('ft-bar-show');
    });

    scope.showimg = function() {
        var width = M.one('body').get('region').width,
            scale = 640 / 200,
            height = 'auto',
            html;
        M.mask({
            ele: ele,
            zIndex: 89
        });

        var photoData = {};
        photoData.list = ["./img/temp/img07.jpg",
            "./img/temp/img08.jpg",
            "./img/temp/img09.jpg",
            "./img/temp/img10.jpg",
            "./img/temp/img11.jpg",
            "./img/temp/img12.jpg"
        ];
        photoData.content = "";
        html = M.Node.create(M.Template.get('photo-page')(photoData));
        ele.append(html);
        //设定
        //设定图片尺寸自适应
        ele.all('.img-box').setStyles({
            'width': width
                //'height': 'height'
        })
        ele.one('.slider-img').setStyles({
            'width': width
                //'height': 'height'
        })
        ele.one('.picture-page').all('img').each(function() {
            this.setStyle('maxWidth', '100%');
            this.setStyle('maxHeight', '80%');
        });
        ele.role('slider').plug([{
            fn: M.Plugin.Switchable,
            cfg: {
                autoplay: false,
                pauseOnHover: true,
                interval: 2,
                circle: true,
                touch: true,
                navCls: 'slider-nav',
                contentCls: 'slider-img',
                activeTriggerCls: 'on',
                viewSize: [width, height]
            }
        }, {
            fn: M.Plugin.SwitchableEffect,
            cfg: {
                relateType: "switchable",
                effect: 'scrollX',
                duration: 0.2,
                circle: true
            }
        }, {
            fn: M.Plugin.SwitchableLazyLoad,
            cfg: {
                relateType: "switchable",
                lazyload: true,
                lazyDataType: 'data-src'
            }
        }]);

        ele.one('.picture-page').touch('swipe', function() {
                return;
            })
            //点击空白区域关闭
        html.on('click', function(evt) {

            html.remove();
            M.mask.hide();
        })
    }
});