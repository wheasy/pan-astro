module.exports = {
    mojsDepends: {
        // 'moto': {
        //     require: ['history']
        // },
        // 'moto-compiler': {
        //     require: ['moto-router']
        // },
        // 'moto-view': {
        //     require: ['moto-compiler', 'template']
        // },
        // 'moto-router': {
        //     require: ['moto-resource']
        // },
        // 'moto-resource': {
        //     require: ['moto', 'localstorage', 'xpost']
        // },

        // 'history': {},
        // 'loader': {
        //     require: []
        // },
        // 'lang': {
        //     require: []
        // },
        // 'node-attrs': {},
        // 'node-cls': {},
        // 'node-data': {},
        // 'node-core': {
        //     require: ['selector', 'node-cls']
        // },
        // 'node': {
        //     require: ['node-list', 'node-data', 'node-event']
        // },
        // 'node-list': {
        //     require: ['node-core']
        // },
        // 'selector': {
        //     require: ['dom', 'node-attrs']
        // },
        // 'dom': {},
        // 'event': {},
        // 'touch': {},
        // 'node-event': {
        //     require: ['event']
        // },
        // 'io-core': {},
        // 'io': {
        //     require: ['io-core', 'node']
        // },
        // 'template': {},
        // 'jsonp': {
        //     require: ['node']
        // },
        // 'anim': {
        //     require: ['node']
        // },
        // 'anim-node-plugin': {
        //     require: ['anim', 'node-plugin']
        // },
        // 'anim-effect': {
        //     require: ['anim']
        // },
        // 'plugin': {},
        // 'node-plugin': {
        //     require: ['node', 'plugin']
        // },
        // 'switchable-plugin': {
        //     require: ['node-plugin', 'touch']
        // },
        // 'switchable-effect-plugin': {
        //     require: ['switchable-plugin', 'anim', 'anim-effect']
        // },
        // 'switchable-lazyload-plugin': {
        //     require: ['inscreen']
        // },
        // 'button-plugin': {
        //     require: ['node-plugin', 'template']
        // },
        // 'drag-plugin': {
        //     require: ['node-plugin']
        // },
        // 'slider': {
        //     require: ['node-plugin', 'drag-plugin']
        // },
        // 'image-crop': {
        //     require: ['drag-plugin', 'slider', 'anim-node-plugin', 'anim-effect']
        // },
        // 'image-crop-smart': {
        //     require: ['drag-plugin']
        // },
        // 'link-share': {
        //     require: ['node', 'template']
        // },
        // 'paging-plugin': {
        //     require: ['node-plugin', 'event', 'template', 'io']
        // },
        // 'widget': {
        //     require: ['node', 'plugin', 'template']
        // },
        // 'overlay': {
        //     require: []
        // },
        // 'gotop': {
        //     require: ['widget', 'anim']
        // },
        // 'dialog': {
        //     require: ['button-plugin', 'overlay', 'io', 'jsonp']
        // },
        // 'fixed': {
        //     require: ['node', 'widget']
        // },
        // 'formvalidate-plugin': {
        //     require: ['node-plugin', 'xpost', 'button-plugin', 'placeholder', 'textlimit-plugin', 'select', 'io-iframe', 'overlay', 'caution']
        // },
        // 'cascade': {
        //     require: ['node']
        // },
        // 'cascading-menu': {
        //     require: ['node', 'widget']
        // },
        // 'optionlist': {
        //     require: ['node-plugin', 'overlay']
        // },
        // 'select': {
        //     require: ['optionlist']
        // },
        // 'inscreen': {},
        // 'ms-auth': {
        //     require: []
        // },
        // 'cartinput-plugin': {
        //     require: ['node-plugin', 'node-event']
        // },
        // 'textlimit-plugin': {
        //     require: ['node-plugin', 'node-event']
        // },
        // 'swfupload': {
        //     require: ['node', 'node-plugin']
        // },
        // 'syncwrite': {
        //     require: ['node']
        // },
        // 'placeholder': {
        //     require: ['node', 'node-plugin', 'event']
        // },
        // 'follow-plugin': {
        //     require: ['node', 'node-plugin', 'event', 'dialog-login', 'widget']
        // },
        // 'localstorage': {},
        // 'imagezoom-plugin': {
        //     require: ['node', 'node-plugin', 'event']
        // },
        // 'swf': {
        //     require: ['node', 'event']
        // },
        // 'uploader': {
        //     require: ['node', 'widget', 'button-plugin', 'swf', 'io-iframe']
        // },
        // 'cascade-select': {
        //     require: ['select', 'xpost', 'template']
        // },
        // 'dialog-login': {
        //     require: ['dialog', 'formvalidate-plugin']
        // },
        // 'autocomplete-plugin': {
        //     require: ['node', 'node-plugin', 'event', 'optionlist', 'xpost']
        // },
        // 'autocomplete-name-plugin': {
        //     require: ['autocomplete-plugin', 'focus-help']
        // },
        // 'focus-help': {},

        // 'io-iframe': {
        //     require: ['node', 'event']
        // },
        // 'xpost': {
        //     require: ['event','jsonp', 'io-xdr']
        // },
        // 'io-xdr': {
        //     require: ['event', 'swf', 'io']
        // },
        // 'calendar': {
        //     require: ['overlay']
        // },
        // 'mask': {},
        // 'lazyloader': {
        //     require: ['xpost', 'inscreen']
        // },
        // 'popup': {
        //     require: ['overlay']
        // },
        // 'scroll-plugin': {
        //     require: ['node-plugin', 'drag-plugin']
        // },
        // 'moto-confirm': {
        //     require: ['template']
        // },
        // 'moto-scroll': {}
    },
    motojs: [
        'mo/mo.js',
        'lang/lang.js',
        'array/array.js',
        'dom/dom.js',
        'dom-extend/dom-extend.js',
        'node-core/node-core.js',
        'node-attrs/node-attrs.js',
        'node-dom/node-dom.js',
        'node-style/node-style.js',
        'location/location.js',
        'base/base.js',
        'selector/selector.js',
        'event/event.js',
        'node-cls/node-cls.js',
        'node-data/node-data.js',
        'node-event/node-event.js',
        'node-list/node-list.js',
        'node/node.js',
        'template/template.js',
        'widget/widget.js',
        'history/history.js',
        'localstorage/localstorage.js',
        // 'json-parse/json-parse.js',
        'event/event.js',
        // 'swf/swf.js',
        'io-core/io-core.js',
        'io/io.js',
        'jsonp/jsonp.js',
        'xpost/xpost.js',
        'plugin/plugin.js',
        'node-plugin/node-plugin.js',
        'moto/moto.js',
        'moto-resource/moto-resource.js',
        'moto-router/moto-router.js',
        'moto-compiler/moto-compiler.js',
        'moto-view/moto-view.js',
        'moto-plugin/moto-plugin.js',
        'moto-plug-back/moto-plug-back.js',
        'moto-form/moto-form.js',
        // 'moto-amount-plugin/moto-amount-plugin.js',
        'moto-scrollbox/moto-scrollbox.js',
        'switchable-plugin/switchable-plugin.js',
        'switchable-effect-plugin/switchable-effect-plugin.js',
        'switchable-lazyload-plugin/switchable-lazyload-plugin.js',
        'inscreen/inscreen.js',
        'touch/touch.js',
        'mask/mask.js',
        'anim/anim.js',
        'moto-confirm/moto-confirm.js',
        'moto-scroll/moto-scroll.js'
    ]
}