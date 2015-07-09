/**
 * 修改自YUI3 Selector
 * 支持格式如：
 *
 *   #foo{} .bar{} a#foo.bar{} #foo{} a[href]{} ul#list > li {} #foo a {}
 *   #foo a[title~=hello] {} #foo a[href^="http://"] {} #foo a[href$=com] {} #foo a[href*=twitter]
 *   span ~ strong {} p + p {}
 *   div,p{}
 *
 *
 * @module: dom
 * @submodule selector
 * @author: jiangjibing
 * @date: 2013/6/26
 */


Mo.define('selector',function(M) {
    M.namespace('Selector');

    var COMPARE_DOCUMENT_POSITION = 'compareDocumentPosition',
        OWNER_DOCUMENT = 'ownerDocument',
        PARENT_NODE = 'parentNode',
        TAG_NAME = 'tagName',
        ATTRIBUTES = 'attributes',
        COMBINATOR = 'combinator',
        PSEUDOS = 'pseudos',
        PREVIOUSSIBLING = 'previousSibling',
        STR_PARENT_NODE = 'parentNode',
        M_DOM = M.DOM,
        MArray = M.Array,
        Lang = M.Lang,

        M_DOM_getAttr = M.attributeManager.getAttr,


        _reNth = /^(?:([\-]?\d*)(n){1}|(odd|even)$)*([\-+]?\d*)$/;

        //debugger;

    var Selector = {
        _types: {
            esc: {
                token: '\uE000',
                re: /\\[:\[\]\(\)#\.\'\>+~"]/gi
            },

            attr: {
                token: '\uE001',
                re: /(\[[^\]]*\])/g
            },

            pseudo: {
                token: '\uE002',
                re: /(\([^\)]*\))/g
            }
        },

        useNative: true,

        _escapeId: function(id) {
            if (id) {
                id = id.replace(/([:\[\]\(\)#\.'<>+~"])/g,'\\$1');
            }
            return id;
        },

        _compare: ('sourceIndex' in M.config.doc.documentElement) ?
            function(nodeA, nodeB) {
                var a = nodeA.sourceIndex,
                    b = nodeB.sourceIndex;

                if (a === b) {
                    return 0;
                } else if (a > b) {
                    return 1;
                }

                return -1;

            } : (M.config.doc.documentElement[COMPARE_DOCUMENT_POSITION] ?
            function(nodeA, nodeB) {
                if (nodeA[COMPARE_DOCUMENT_POSITION](nodeB) & 4) {
                    return -1;
                } else {
                    return 1;
                }
            } :
            function(nodeA, nodeB) {
                var rangeA, rangeB, compare;
                if (nodeA && nodeB) {
                    rangeA = nodeA[OWNER_DOCUMENT].createRange();
                    rangeA.setStart(nodeA, 0);
                    rangeB = nodeB[OWNER_DOCUMENT].createRange();
                    rangeB.setStart(nodeB, 0);
                    compare = rangeA.compareBoundaryPoints(1, rangeB); // 1 === Range.START_TO_END
                }

                return compare;

        }),

        _sort: function(nodes) {
            if (nodes) {
                nodes = MArray.toArray(nodes, 0, true);
                if (nodes.sort) {
                    nodes.sort(Selector._compare);
                }
            }

            return nodes;
        },

        _deDupe: function(nodes) {
            var ret = [],
                i, node;

            for (i = 0; (node = nodes[i++]);) {
                if (!node._found) {
                    ret[ret.length] = node;
                    node._found = true;
                }
            }

            for (i = 0; (node = ret[i++]);) {
                node._found = null;
                node.removeAttribute('_found');
            }

            return ret;
        },

        /**
         * Retrieves a set of nodes based on a given CSS selector.
         * @method query
         *
         * @param {string} selector The CSS Selector to test the node against.
         * @param {HTMLElement} root optional An HTMLElement to start the query from. Defaults to M.config.doc
         * @param {Boolean} firstOnly optional Whether or not to return only the first match.
         * @return {Array} An array of nodes that match the given selector.
         * @static
         */
        query: function(selector, root, firstOnly, skipNative) {
            root = root || M.config.doc;
            var ret = [],
                useNative = (M.Selector.useNative && M.config.doc.querySelector && !skipNative),
                queries = [[selector, root]],
                query,
                result,
                i,
                fn = (useNative) ? M.Selector._nativeQuery : M.Selector._bruteQuery;

            if (selector && fn) {
                // split group into seperate queries
                if (!skipNative && // already done if skipping
                        (!useNative || root.tagName)) { // split native when element scoping is needed
                    queries = Selector._splitQueries(selector, root);
                }

                for (i = 0; (query = queries[i++]);) {
                    result = fn(query[0], query[1], firstOnly);
                    if (!firstOnly) { // coerce DOM Collection to Array
                        result = MArray.toArray(result, 0, true);
                    }
                    if (result) {
                        ret = ret.concat(result);
                    }
                }

                if (queries.length > 1) { // remove dupes and sort by doc order
                    ret = Selector._sort(Selector._deDupe(ret));
                }
            }

            return (firstOnly) ? (ret[0] || null) : ret;

        },

        _replaceSelector: function(selector) {
            var esc = M.Selector._parse('esc', selector), // pull escaped colon, brackets, etc.
                attrs,
                pseudos;

            // first replace escaped chars, which could be present in attrs or pseudos
            selector = M.Selector._replace('esc', selector);

            // then replace pseudos before attrs to avoid replacing :not([foo])
            pseudos = M.Selector._parse('pseudo', selector);
            selector = Selector._replace('pseudo', selector);

            attrs = M.Selector._parse('attr', selector);
            selector = M.Selector._replace('attr', selector);

            return {
                esc: esc,
                attrs: attrs,
                pseudos: pseudos,
                selector: selector
            };
        },

        _restoreSelector: function(replaced) {
            var selector = replaced.selector;
            selector = M.Selector._restore('attr', selector, replaced.attrs);
            selector = M.Selector._restore('pseudo', selector, replaced.pseudos);
            selector = M.Selector._restore('esc', selector, replaced.esc);
            return selector;
        },

        _replaceCommas: function(selector) {
            var replaced = M.Selector._replaceSelector(selector),
                selector = replaced.selector;

            if (selector) {
                selector = selector.replace(/,/g, '\uE007');
                replaced.selector = selector;
                selector = M.Selector._restoreSelector(replaced);
            }
            return selector;
        },

        // allows element scoped queries to begin with combinator
        // e.g. query('> p', document.body) === query('body > p')
        _splitQueries: function(selector, node) {
            if (selector.indexOf(',') > -1) {
                selector = M.Selector._replaceCommas(selector);
            }

            var groups = selector.split('\uE007'), // split on replaced comma token
                queries = [],
                prefix = '',
                id,
                i,
                len;

            if (node) {
                // enforce for element scoping
                if (node.nodeType === 1) { // Elements only
                    id = M.Selector._escapeId(M_DOM.getId(node));

                    if (!id) {
                        id = M.guid();
                        M_DOM.setId(node, id);
                    }

                    prefix = '[id="' + id + '"] ';
                }

                for (i = 0, len = groups.length; i < len; ++i) {
                    selector =  prefix + groups[i];
                    queries.push([selector, node]);
                }
            }

            return queries;
        },

        _nativeQuery: function(selector, root, one) {
            if (M.UA.webkit && selector.indexOf(':checked') > -1 &&
                    (M.Selector.pseudos && M.Selector.pseudos.checked)) { // webkit (chrome, safari) fails to pick up "selected"  with "checked"
                return M.Selector.query(selector, root, one, true); // redo with skipNative true to try brute query
            }
            try {
                return root['querySelector' + (one ? '' : 'All')](selector);
            } catch(e) { // fallback to brute if available
                return M.Selector.query(selector, root, one, true); // redo with skipNative true
            }
        },

        filter: function(nodes, selector) {
            var ret = [],
                i, node;

            if (nodes && selector) {
                for (i = 0; (node = nodes[i++]);) {
                    if (M.Selector.test(node, selector)) {
                        ret[ret.length] = node;
                    }
                }
            } else {
            }

            return ret;
        },
        /**
         * 测试node是否在root节点的selector选择器下
         * @param  {Object} node     测试节点
         * @param  {String|Function} selector 选择器|函数
         * @param  {Object} root     目标节点
         * @return {Boolean}          [description]
         */
        test: function(node, selector, root) {
            var ret = false,
                useFrag = false,
                groups,
                parent,
                item,
                items,
                frag,
                id,
                i, j, group;

            if (node && node.tagName) { // only test HTMLElements

                if (typeof selector == 'function') { // test with function
                    ret = selector.call(node, node);
                } else { // test with query
                    // we need a root if off-doc
                    groups = selector.split(',');
                    if (!root && !M_DOM.inDoc(node)) {
                        parent = node.parentNode;
                        if (parent) {
                            root = parent;
                        } else { // only use frag when no parent to query
                            frag = node[OWNER_DOCUMENT].createDocumentFragment();
                            frag.appendChild(node);
                            root = frag;
                            useFrag = true;
                        }
                    }
                    root = root || node[OWNER_DOCUMENT];

                    id = M.Selector._escapeId(M_DOM.getId(node));
                    if (!id) {
                        id = M.guid();
                        M_DOM.setId(node, id);
                    }

                    for (i = 0; (group = groups[i++]);) { // TODO: off-dom test
                        group += '[id="' + id + '"]';
                        items = M.Selector.query(group, root);

                        for (j = 0; item = items[j++];) {
                            if (item === node) {
                                ret = true;
                                break;
                            }
                        }
                        if (ret) {
                            break;
                        }
                    }

                    if (useFrag) { // cleanup
                        frag.removeChild(node);
                    }
                };
            }

            return ret;
        },

        /**
         * A convenience function to emulate M.Node's aNode.ancestor(selector).
         * @param {HTMLElement} element An HTMLElement to start the query from.
         * @param {String} selector The CSS selector to test the node against.
         * @return {HTMLElement} The ancestor node matching the selector, or null.
         * @param {Boolean} testSelf optional Whether or not to include the element in the scan
         * @static
         * @method ancestor
         */
         /*
        ancestor: function (element, selector, testSelf) {
            return M_DOM.ancestor(element, function(n) {
                return M.Selector.test(n, selector);
            }, testSelf);
        },
        */

        _parse: function(name, selector) {
            return selector.match(M.Selector._types[name].re);
        },

        _replace: function(name, selector) {
            var o = M.Selector._types[name];
            return selector.replace(o.re, o.token);
        },

        _restore: function(name, selector, items) {
            if (items) {
                var token = M.Selector._types[name].token,
                    i, len;
                for (i = 0, len = items.length; i < len; ++i) {
                    selector = selector.replace(token, items[i]);
                }
            }
            return selector;
        },

        getId: function(node) {
            var id;
            // HTMLElement returned from FORM when INPUT name === "id"
            // IE < 8: HTMLCollection returned when INPUT id === "id"
            // via both getAttribute and form.id
            if (node.id && !node.id.tagName && !node.id.item) {
                id = node.id;
            } else if (node.attributes && node.attributes.id) {
                id = node.attributes.id.value;
            }

            return id;
        },

        setId: function(node, id) {
            if (node.setAttribute) {
                node.setAttribute('id', id);
            } else {
                node.id = id;
            }
        },

        _getNth : function(node, expr, tag, reverse) {
            _reNth.test(expr);
            var a = parseInt(RegExp.$1, 10), // include every _a_ elements (zero means no repeat, just first _a_)
                n = RegExp.$2, // "n"
                oddeven = RegExp.$3, // "odd" or "even"
                b = parseInt(RegExp.$4, 10) || 0, // start scan from element _b_
                result = [],
                siblings = M_DOM._children(node.parentNode, tag),
                op;

            if (oddeven) {
                a = 2; // always every other
                op = '+';
                n = 'n';
                b = (oddeven === 'odd') ? 1 : 0;
            } else if ( isNaN(a) ) {
                a = (n) ? 1 : 0; // start from the first or no repeat
            }

            if (a === 0) { // just the first
                if (reverse) {
                    b = siblings.length - b + 1;
                }

                if (siblings[b - 1] === node) {
                    return true;
                } else {
                    return false;
                }

            } else if (a < 0) {
                reverse = !!reverse;
                a = Math.abs(a);
            }

            if (!reverse) {
                for (var i = b - 1, len = siblings.length; i < len; i += a) {
                    if ( i >= 0 && siblings[i] === node ) {
                        return true;
                    }
                }
            } else {
                for (var i = siblings.length - b, len = siblings.length; i >= 0; i -= a) {
                    if ( i < len && siblings[i] === node ) {
                        return true;
                    }
                }
            }
            return false;
        },

        //CSS2支持
        _reRegExpTokens: /([\^\$\?\[\]\*\+\-\.\(\)\|\\])/,
        SORT_RESULTS: true,

        // TODO: better detection, document specific
        _isXML: (function() {
            var isXML = (M.config.doc.createElement('div').tagName !== 'DIV');
            return isXML;
        }()),

        /**
         * Mapping of shorthand tokens to corresponding attribute selector
         * @property shorthand
         * @type object
         */
        shorthand: {
            '\\#(-?[_a-z0-9]+[-\\w\\uE000]*)': '[id=$1]',
            '\\.(-?[_a-z]+[-\\w\\uE000]*)': '[className~=$1]'
        },

        /**
         * List of operators and corresponding boolean functions.
         * These functions are passed the attribute and the current node's value of the attribute.
         * @property operators
         * @type object
         */
        operators: {
            '': function(node, attr) { return M_DOM_getAttr(node, attr) !== ''; }, // Just test for existence of attribute
            '~=': '(?:^|\\s+){val}(?:\\s+|$)', // space-delimited
            '|=': '^{val}-?', // optional hyphen-delimited
            '^=': '^{val}', // Match starts with value
            '$=': '{val}$', // Match ends with value
            '*=': '{val}' // Match contains value as substring
        },

        pseudos: {
           'first-child': function(node) {
                return M_DOM._children(node[PARENT_NODE])[0] === node;
            },
            'root': function(node) {
                return node === node.ownerDocument.documentElement;
            },

            'nth-child': function(node, expr) {
                return M.Selector._getNth(node, expr);
            },

            'nth-last-child': function(node, expr) {
                return M.Selector._getNth(node, expr, null, true);
            },

            'nth-of-type': function(node, expr) {
                return M.Selector._getNth(node, expr, node.tagName);
            },

            'nth-last-of-type': function(node, expr) {
                return M.Selector._getNth(node, expr, node.tagName, true);
            },

            'last-child': function(node) {
                var children = M_DOM._children(node.parentNode);
                return children[children.length - 1] === node;
            },

            'first-of-type': function(node) {
                return M_DOM._children(node.parentNode, node.tagName)[0] === node;
            },

            'last-of-type': function(node) {
                var children = M_DOM._children(node.parentNode, node.tagName);
                return children[children.length - 1] === node;
            },

            'only-child': function(node) {
                var children = M_DOM._children(node.parentNode);
                return children.length === 1 && children[0] === node;
            },

            'only-of-type': function(node) {
                var children = M_DOM._children(node.parentNode, node.tagName);
                return children.length === 1 && children[0] === node;
            },

            'empty': function(node) {
                return node.childNodes.length === 0;
            },

            'not': function(node, expr) {
                return !M.Selector.test(node, expr);
            },

            'contains': function(node, expr) {
                var text = node.innerText || node.textContent || '';
                return text.indexOf(expr) > -1;
            },

            'checked': function(node) {
                return (node.checked === true || node.selected === true);
            },

            'enabled': function(node) {
                return (node.disabled !== undefined && !node.disabled);
            },

            'disabled': function(node) {
                return (node.disabled);
            }
        },

        _bruteQuery: function(selector, root, firstOnly) {
            var ret = [],
                nodes = [],
                tokens = Selector._tokenize(selector),
                token = tokens[tokens.length - 1],
                rootDoc = M_DOM._getDoc(root),
                child,
                id,
                className,
                tagName;

            if (token) {
                // prefilter nodes
                id = token.id;
                className = token.className;
                tagName = token.tagName || '*';

                if (root.getElementsByTagName) { // non-IE lacks DOM api on doc frags
                    // try ID first, unless no root.all && root not in document
                    // (root.all works off document, but not getElementById)
                    if (id && (root.all || (root.nodeType === 9 || M_DOM.inDoc(root)))) {
                        nodes = M_DOM.allById(id, root);
                    // try className
                    } else if (className) {
                        nodes = root.getElementsByClassName(className);
                    } else { // default to tagName
                        nodes = root.getElementsByTagName(tagName);
                    }

                } else { // brute getElementsByTagName()
                    child = root.firstChild;
                    while (child) {
                        // only collect HTMLElements
                        // match tag to supplement missing getElementsByTagName
                        if (child.tagName && (tagName === '*' || child.tagName === tagName)) {
                            nodes.push(child);
                        }
                        child = child.nextSibling || child.firstChild;
                    }
                }
                if (nodes.length) {
                    ret = Selector._filterNodes(nodes, tokens, firstOnly);
                }
            }

            return ret;
        },

        _filterNodes: function(nodes, tokens, firstOnly) {
            var i = 0,
                j,
                len = tokens.length,
                n = len - 1,
                result = [],
                node = nodes[0],
                tmpNode = node,
                getters = M.Selector.getters,
                operator,
                combinator,
                token,
                path,
                pass,
                value,
                tests,
                test;

            for (i = 0; (tmpNode = node = nodes[i++]);) {
                n = len - 1;
                path = null;

                testLoop:
                while (tmpNode && tmpNode.tagName) {
                    token = tokens[n];
                    tests = token.tests;
                    j = tests.length;
                    if (j && !pass) {
                        while ((test = tests[--j])) {
                            operator = test[1];
                            if (getters[test[0]]) {
                                value = getters[test[0]](tmpNode, test[0]);
                            } else {
                                value = tmpNode[test[0]];
                                if (test[0] === 'tagName' && !Selector._isXML) {
                                    value = value.toUpperCase();
                                }
                                if (typeof value != 'string' && value !== undefined && value.toString) {
                                    value = value.toString(); // coerce for comparison
                                } else {
                                     try{
                                        if (value === undefined && tmpNode.getAttribute) {
                                            value = tmpNode.getAttribute(test[0]);
                                        }

                                    }catch(ee){}
                                }


                            }

                            if ((operator === '=' && value !== test[2]) ||  // fast path for equality
                                (typeof operator !== 'string' && // protect against String.test monkey-patch (Moo)
                                operator.test && !operator.test(value)) ||  // regex test
                                (!operator.test && // protect against RegExp as function (webkit)
                                        typeof operator === 'function' && !operator(tmpNode, test[0], test[2]))) { // function test

                                // skip non element nodes or non-matching tags
                                if ((tmpNode = tmpNode[path])) {
                                    while (tmpNode &&
                                        (!tmpNode.tagName ||
                                            (token.tagName && token.tagName !== tmpNode.tagName))
                                    ) {
                                        tmpNode = tmpNode[path];
                                    }
                                }
                                continue testLoop;
                            }
                        }
                    }

                    n--; // move to next token
                    // now that we've passed the test, move up the tree by combinator
                    if (!pass && (combinator = token.combinator)) {
                        path = combinator.axis;
                        tmpNode = tmpNode[path];

                        // skip non element nodes
                        while (tmpNode && !tmpNode.tagName) {
                            tmpNode = tmpNode[path];
                        }

                        if (combinator.direct) { // one pass only
                            path = null;
                        }

                    } else { // success if we made it this far
                        result.push(node);
                        if (firstOnly) {
                            return result;
                        }
                        break;
                    }
                }
            }
            node = tmpNode = null;
            return result;
        },

        combinators: {
            ' ': {
                axis: PARENT_NODE
            },

            '>': {
                axis: PARENT_NODE,
                direct: true
            },


            '+': {
                axis: PREVIOUSSIBLING,
                direct: true
            },

            '~' : {
                axis: PREVIOUSSIBLING
            }
        },

        _parsers: [
            {
                name: ATTRIBUTES,
                re: /^\uE003(-?[a-z]+[\w\-]*)+([~\|\^\$\*!=]=?)?['"]?([^\uE004'"]*)['"]?\uE004/i,
                fn: function(match, token) {
                    var operator = match[2] || '',
                        operators = Selector.operators,
                        escVal = (match[3]) ? match[3].replace(/\\/g, '') : '',
                        test;

                    // add prefiltering for ID and CLASS
                    if ((match[1] === 'id' && operator === '=') ||
                            (match[1] === 'className' &&
                            M.config.doc.documentElement.getElementsByClassName &&
                            (operator === '~=' || operator === '='))) {
                        token.prefilter = match[1];


                        match[3] = escVal;

                        // escape all but ID for prefilter, which may run through QSA (via Dom.allById)
                        token[match[1]] = (match[1] === 'id') ? match[3] : escVal;

                    }

                    // add tests
                    if (operator in operators) {
                        test = operators[operator];
                        if (typeof test === 'string') {
                            match[3] = escVal.replace(Selector._reRegExpTokens, '\\$1');
                            test = new RegExp(test.replace('{val}', match[3]));
                        }
                        match[2] = test;
                    }
                    if (!token.last || token.prefilter !== match[1]) {
                        return match.slice(1);
                    }
                }
            },
            {
                name: TAG_NAME,
                re: /^((?:-?[_a-z]+[\w-]*)|\*)/i,
                fn: function(match, token) {
                    var tag = match[1];

                    if (!Selector._isXML) {
                        tag = tag.toUpperCase();
                    }

                    token.tagName = tag;

                    if (tag !== '*' && (!token.last || token.prefilter)) {
                        return [TAG_NAME, '=', tag];
                    }
                    if (!token.prefilter) {
                        token.prefilter = 'tagName';
                    }
                }
            },
            {
                name: COMBINATOR,
                re: /^\s*([>+~]|\s)\s*/,
                fn: function(match, token) {
                }
            },
            {
                name: PSEUDOS,
                re: /^:([\-\w]+)(?:\uE005['"]?([^\uE005]*)['"]?\uE006)*/i,
                fn: function(match, token) {
                    var test = Selector[PSEUDOS][match[1]];
                    if (test) { // reorder match array and unescape special chars for tests
                        if (match[2]) {
                            match[2] = match[2].replace(/\\/g, '');
                        }
                        return [match[2], test];
                    } else { // selector token not supported (possibly missing CSS3 module)
                        return false;
                    }
                }
            }
            ],

        _getToken: function(token) {
            return {
                tagName: null,
                id: null,
                className: null,
                attributes: {},
                combinator: null,
                tests: []
            };
        },

        /*
            Break selector into token units per simple selector.
            Combinator is attached to the previous token.
         */
        _tokenize: function(selector) {
            selector = selector || '';
            selector = Selector._parseSelector(Lang.trim(selector));
            var token = Selector._getToken(),     // one token per simple selector (left selector holds combinator)
                query = selector, // original query for debug report
                tokens = [],    // array of tokens
                found = false,  // whether or not any matches were found this pass
                match,         // the regex match
                test,
                i, parser;
            /*
                Search for selector patterns, store, and strip them from the selector string
                until no patterns match (invalid selector) or we run out of chars.

                Multiple attributes and pseudos are allowed, in any order.
                for example:
                    'form:first-child[type=button]:not(button)[lang|=en]'
            */
            outer:
            do {
                found = false; // reset after full pass
                for (i = 0; (parser = Selector._parsers[i++]);) {
                    if ( (match = parser.re.exec(selector)) ) { // note assignment
                        if (parser.name !== COMBINATOR ) {
                            token.selector = selector;
                        }
                        selector = selector.replace(match[0], ''); // strip current match from selector
                        if (!selector.length) {
                            token.last = true;
                        }

                        if (Selector._attrFilters[match[1]]) { // convert class to className, etc.
                            match[1] = Selector._attrFilters[match[1]];
                        }

                        test = parser.fn(match, token);
                        if (test === false) { // selector not supported
                            found = false;
                            break outer;
                        } else if (test) {
                            token.tests.push(test);
                        }

                        if (!selector.length || parser.name === COMBINATOR) {
                            tokens.push(token);
                            token = Selector._getToken(token);
                            if (parser.name === COMBINATOR) {
                                token.combinator = M.Selector.combinators[match[1]];
                            }
                        }
                        found = true;
                    }
                }
            } while (found && selector.length);

            if (!found || selector.length) { // not fully parsed
                tokens = [];
            }
            return tokens;
        },

        _replaceMarkers: function(selector) {
            selector = selector.replace(/\[/g, '\uE003');
            selector = selector.replace(/\]/g, '\uE004');

            selector = selector.replace(/\(/g, '\uE005');
            selector = selector.replace(/\)/g, '\uE006');
            return selector;
        },

        _replaceShorthand: function(selector) {
            var shorthand = M.Selector.shorthand,
                re;

            for (re in shorthand) {
                if (shorthand.hasOwnProperty(re)) {
                    selector = selector.replace(new RegExp(re, 'gi'), shorthand[re]);
                }
            }

            return selector;
        },

        _parseSelector: function(selector) {
            var replaced = M.Selector._replaceSelector(selector),
                selector = replaced.selector;

            // replace shorthand (".foo, #bar") after pseudos and attrs
            // to avoid replacing unescaped chars
            selector = M.Selector._replaceShorthand(selector);

            selector = M.Selector._restore('attr', selector, replaced.attrs);
            selector = M.Selector._restore('pseudo', selector, replaced.pseudos);

            // replace braces and parens before restoring escaped chars
            // to avoid replacing ecaped markers
            selector = M.Selector._replaceMarkers(selector);
            selector = M.Selector._restore('esc', selector, replaced.esc);

            return selector;
        },

        _attrFilters: {
            'class': 'className',
            'for': 'htmlFor'
        },

        getters: {
            href: function(node, attr) {
                return M_DOM_getAttr(node, attr);
            },

            id: function(node, attr) {
                return M_DOM.getId(node);
            }
        }



    };







    M.mix(M.Selector, Selector);

});
