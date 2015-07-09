/**
 * io-iframe
 * @module: io-iframe
 * @author: zhangjian
 * @date: 2013/7/22
 */

Mo.define('io-iframe', function (M) {
	M.namespace('io');
	var ioiframequeue = {},
		DOC = M.one('body'),
		std = (document.documentMode && document.documentMode >= 8),
		IFRAME = 'iframe';
	function IoIframe(config) {
		this.init.apply(this, arguments);
	}
	//M.extend(IO, M.EventTarget);
	M.extend(IoIframe, {
		init : function (options) {
			var self = this;
			self.opts = M.merge({}, options);
			self.opts.hasForm = self.opts.form ? true : false;
			//如果没有Target则在当前页面刷新
			self.iframeTarget = self.opts.target || IFRAME;//iframe、blank、self
			this._buildForm();
			return this;
		},
		_buildForm : function () {
			var id = M.guid(),
				self = this;

			//Add by jjb 兼容用于form提交的同步数据交换，通过form的target决定跳转位置
			if(self.iframeTarget === IFRAME){
				var frame = M.Node.create('<iframe id="' + id + '" name="' + id + '" class="m-hide" src="' + (M.SSL_SECURE_URL || "javascript:;") + '"></iframe>');

				DOC.append(frame);				
			}else{
				id = self.iframeTarget;
			}
			//debugger
			if (self.opts.hasForm) {
				self.opts.form.setAttr("target", id);
				if(M.Lang.trim(self.opts.url)!=""){
				  self.opts.form.setAttr("action",self.opts.url);
				}
			} else {
				self.opts.form = M.Node.create("<form method='post' target='" + id + "' action='" + (self.opts.url || "") + "'></form>");

				DOC.append(self.opts.form);
			}
			//
			self.opts.form.setAttr(M.UA.ie && !std ? 'encoding' : 'enctype', 'multipart/form-data');
			var hiddens,
			hd;
			if (self.opts.params) { // add dynamic params
				hiddens = [];
				for (var k in self.opts.params) {
					if (self.opts.params.hasOwnProperty(k)) {
						hd = document.createElement('input');
						hd.type = 'hidden';
						hd.name = k;
						hd.value = self.opts.params[k];
						self.opts.form.append(hd);
						hiddens.push(hd);
					}
				}
			}

			function cb() {
				var r = { // bogus response object
					responseText : '',
					responseXML : null
				};

				try { //
					var doc;
					//判断是否ie
					
					doc = (frame.contentDocument || window.frames[id].document);
					
					if (doc && doc.body) {
						r.responseText = doc.body.innerHTML;
					}
					if (doc && doc.XMLDocument) {
						r.responseXML = doc.XMLDocument;
					} else {
						r.responseXML = doc;
					}
				} catch (e) {}

				r  = (/^\{/.test(r.responseText)) ? JSON.parse(r.responseText) : r.responseText; //{}
				frame.off('load', cb);
				self.opts.success && self.opts.success.apply(self.opts.scope, [r] || []);

				setTimeout(function () {
					frame.remove();
					if (!self.opts.hasForm) {
						self.opts.form.remove();
					}
				}, 100);
			}

			if(frame){
				frame.on('load', cb, this);
				self.opts.form.submit();
			}else{
                if(self.opts.success){
                   console.log('1');
//                    var r = { // bogus response object
//                        responseText : '',
//                        responseXML : null
//                    };
//                    self.opts.success && self.opts.success.apply(self.opts.scope, [r] || [])
                }
				if(self.opts.start){
					self.opts.start.call(this, self.opts.form)
				}else{
					if (!self.opts.hasForm) {
						M.later(100, null, function(){
							self.opts.form.remove();
						})
					}
					self.opts.form.submit();
				}
			}


			
		}
	});

	/**
	@description io操作
	@method io
	@static
	@param {options}
	@return {null}
	 **/
	M.io.Iframe = function (options) {
		var _id = M.guid();
		ioiframequeue[_id] = new IoIframe(options)

	};
});
