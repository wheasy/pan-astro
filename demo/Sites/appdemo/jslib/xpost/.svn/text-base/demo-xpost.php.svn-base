<?
	$pagetitle = "xpost";
	$pagedescription = '描述';
	$pagekeywords = "";

	// $UsageCSS = "usage/khk/html/index";
	// $UsageJS = "khk/index";
?>

<?php include("../_inc/before-body-moui.php"); ?>
<span id="test">跨域测试xpost~~</span><br/>
<span id="test2">同域xpost~~</span>
<?php include("../_inc/after-body-moui.php"); ?>

<script>
Mo.require('xpost',function (M) {
	M.one('#test').on('click',function(e){
		var p = M.xPost({
			// url:'http://html.krss.cn/aj/xpost-test.php?a=1',
			url:'http://html.xigua365.com/aj/xpost-test.php?a=1',
		    // url:'a',
			method:'post',
			headers:{
				a:'a',
				b:'b'
			},
			data:{
				c:'csss',
				t:Date.now()
			},
			on:{
				start:function(){
					M.log('start');
				},
				success:function(ret){
					console.log('success',ret);
				},
				failure:function(ret){
					console.log('error',ret);
				}
			}
		});	
	})

		M.one('#test2').on('click',function(e){
			M.xPost({
				url: '/demo/a.json',
				method:'post',
				data: {
					a: 'a'
				},
				on:{
					success:function(e){
//						debugger;
					}
				}
			})
		})
})
</script>
