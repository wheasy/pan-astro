## Astro入门

安装及Hello World请看[这里](https://github.com/wheasy/pan-astro)

### 文件结构

* Sites 项目目录。一个站点一个文件夹。如果文件夹名称以下划线 “_”开头，则项目不会出现在项目列表中。除此之外，项目名称没有硬性要求，但是建议以域名作为项目名称。<br/>以下是一个项目目录的说明：
	* [file]config.js	项目配置文件
	* css			公用CSS或第三方样式文件
	* img			公用或第三方图片。建议使用二倍图，在引用一倍图时会自动压缩。格式为imgname_2x_.png
		* sprite	该目录下的图片文件，会根据图片文件夹名称，把该文件夹下的图片合成一张图片。
	* js			公用或第三方JS文件
	* jslib		JS插件，可在模块或页面中通过@require关键字引用
	* json			临时目录。可忽略。
	* moca			公共样式类库。基于Less，略有改动，样式文件中的所有import均是基于该目录的绝对路径。Moca细节请参看[TODO](TODO)
	* modules		页面模块。要求模块的功能和结构相对独立。
		* mod1
			* mod1.html
			* mod1.js
			* mod1.moca
		* mod2
			* ...
		* ...
	* pages
		* page1
			* page1.html
			* page1.js
			* page1.moca
		* page2
			* ...
		* ...
	* release		发布后的文件。[如何发布？](#publish)
* ...
* 其他目录请参考PandoraJS说明


### 内容组织
Astro遵循模块化开发的理念。页面由相对独立的业务模块组成，如广告轮播图、登录。模块可以由多个页面引用，一个页面也可以同时引用多个模块。关系如下：

	页面1 = 模块1 + 模块2 ... + 页面1个性化内容
	页面2 = 模块1 + 模块3 ... + 页面2个性化内容
	模块1 = 模块a + 模块b ... + 模本1自身内容
	模块2 = 模块a ... + 模本1自身内容

最终生成的JS会对模块之间及JS插件的之间的相互引用进行去重。不必担心多重复引用。


### 模块
模板是页面上相对独立的部分。

模块及页面均包括`结构`、`JS`、`样式`文件及`图片`组成，除结构外，其他文件均可忽略。三个文件必须与模块（页面）的名称相同。图片在放在模块（页面）目录下的img文件夹下。

这里以header模块为例，对模块的定义及使用进行说明。

#### 定义模块
----

图片

* [dir]img
	* logo.png
	* avatar.jpg

------
HTML结构 `header.html`

```html
<header>
	<h1><?$attr.title?></h1>
	<div class="userinfo">
		<?if $attr.status == 'logined'?>
			欢迎你，Tick<img src="avatar.jpg" />
			<a href="#">我的订单</a>
			<a href="#" class="logout">退出</a>
		<?else?>
			<a href="#">登录</a> 
			<a href="#">注册</a>		
		<?/if?>
	</div>
</header>
```

在模块中,通过$attr字段，可以引用在使用模块时指定的字段名称。在模板中，使用了title和status属性。title属性会作为页面标题展示出来。如果指定了status为logined，则显示已登陆状态。这样可以在两个展示效果之间快速切换。

在结构中引用当前模块（页面）的图片时，直接写图片名称即可。

------

样式	`header.moca`

基于Less，可使用Less语法。也可直接使用CSS风格，但文件后缀名必须是`moca`。

```less
@import "lib/element";
header{
	.userinfo{
		......
	}
	.h1{
		background:url(logo.jpg) no-repeat
		......
	}
}
```
在样式文件中引用当前模块（页面）的图片时，直接写图片名称即可。

------
JS		`header.js`

```javascript
//@reqiure dialog,gotop
$(function(){
	$('.logout').click(function(){
		$.dialog(/*...*/);
	});
});
```
JS引用了dialog和gotop组件。通过`@require`关键字，不仅可以引用jslib下面的组件，也能引用外网的JS文件。直接使用`@require http://......`即可。
#### 引用模块
----
以header模块为例:

	<module:header title="首页" status="logined" />

模块有两种引用形式

形式1

	<module:模块名称 属性名称=属性值 />
	
及 形式2

	<module:模块名称 属性名称=属性值>自定义某块内容</module:模块名称>

形式2比形式1多了自定义内容。该区域可以插入HTML。在模块中，通过`<?$mod_content?>`引用。可参看示例中的`page-web-c2`模块。

### 图片

Astro会根据二倍图自动生成一倍图。二倍图的命名规范是图片名称＋2x＋后缀。如：logo2x.png。引用logo.png时，会自动生成一倍图。该功能可以配合LESS[TODO](#)，方便兼容高清屏。

另外，Astro会自动生成雪碧图。如:

* [dir] img
	* [dir] sprite
		* [dir] button
			* login.png
			* avator.png

最终会生成img/sprite/button.png，并自动更新样式文件中的引用。具体可参看实例。


#### JS


### 发布 <a name="publish"></a>

### Astro受益于以下源项目
* node-smushit
* commander
* fs-extra
* images
* uglify-js
* node-smushit
* html-minifier