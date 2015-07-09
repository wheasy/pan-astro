Mo.define('history', function(M) {
    var doc = M.config.doc,
    docMode = doc.documentMode,
    win = M.config.win,
    prefix = '',
    Lang = M.Lang;

    var h = {};

    //静态方法
    var hisStatic = {
        nativeHashChange : ('onhashchange' in win || 'onhashchange' in doc) && (!docMode || docMode > 7),
        getLocation : function() {
            return win && win.location;
        },
        getUrl : function () {
            return location.href;
        },
        encode: function (string) {
            return encodeURIComponent(string).replace(/%20/g, '+');
        },
        createHash: function (params) {
            var encode = HistoryHash.encode,
                hash   = [];

            M.each(params, function (value, key) {
                if (Lang.isValue(value)) {
                    hash.push(encode(key) + '=' + encode(value));
                }
            });

            return hash.join('&');
        },
        encode: function (string) {
            return encodeURIComponent(string).replace(/%20/g, '+');
        },
        parseHash: function (hash) {
            var decode = HistoryHash.decode,
                i,
                len,
                matches,
                param,
                params = {},
                prefix = HistoryHash.hashPrefix,
                prefixIndex;

            hash = Lang.isValue(hash) ? hash : HistoryHash.getHash();

            if (prefix) {
                prefixIndex = hash.indexOf(prefix);

                if (prefixIndex === 0 || (prefixIndex === 1 && hash.charAt(0) === '#')) {
                    hash = hash.replace(prefix, '');
                }
            }

            matches = hash.match(HistoryHash._REGEX_HASH) || [];

            for (i = 0, len = matches.length; i < len; ++i) {
                param = matches[i].split('=');
                params[decode(param[0])] = decode(param[1]);
            }

            return params;
        },
        setHash: function (hash) {
            var location = hisStatic.getLocation();

            if (hash.charAt(0) === '#') {
                hash = hash.substring(1);
            }

            location.hash = (prefix || '') + hash;
        },
        replaceHash: function (hash) {
            var location = hisStatic.getLocation(),
                base     = location.href.replace(/#.*$/, '');

            if (hash.charAt(0) === '#') {
                hash = hash.substring(1);
            }

            location.replace(base + '#' + (prefix || '') + hash);
        },
        getHashByUrl:function(url){
            var matches = /#(.*)$/.exec(url),
                hash = matches && matches[1] || '';
                return prefix && hash.indexOf(prefix) === 0 ? hash.replace(prefix, '') : hash;
        },
        getHash : (M.UA.gecko ?
            function() {
                return h.getHashByUrl(hisStatic.getLocation());
            }: function() {
                var location = hisStatic.getLocation(),
                    hash = location.hash.substring(1);
                // Slight code duplication here, but execution speed is of the essence
                // since getHash() is called every 50ms to poll for changes in browsers
                // that don't support native onhashchange. An additional function call
                // would add unnecessary overhead.
                return prefix && hash.indexOf(prefix) === 0 ? hash.replace(prefix, '') : hash;
        }),
        oldUrl: '',
        oldHash: ''
    };

    //M.extend(h, {});

    M.each(hisStatic, function(f, k) {
        h[k] = f;
    });
    //原生支持hashChange方法
    if (h.nativeHashChange) {
        var w = M.one(win);
            
        w.on('hashchange', function(evt) {
            var newHash = hisStatic.getHash(),
                newUrl  = hisStatic.getUrl();
            w.fire('mhashChange', {
                event:evt,
                oldHash: hisStatic.oldHash,
                oldUrl: hisStatic.oldUrl,
                newHash: newHash,
                newUrl: newUrl
            }, win);
            hisStatic.oldHash = newHash;
            hisStatic.oldUrl  = newUrl;
        });
    }
    M.History = h;
});