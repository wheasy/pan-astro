var pan = require('pandorajs'),
    panUtils = require('pan-utils'),
    fs = require('fs'),
    path = require('path'), 
    mfile = panUtils.file,
    mutil = panUtils.util,
    // 图片处理模块images基于CC++开发,需要跟进不同平台编译.根据windows和非windows环境,biuild了两个模块
    images = require('images'),
	imgExt = ['.jpg','.png'];


var sprite = {

	merge:function(projectName)
	{
		var releaseDir = pan.getFilePath(projectName,'img');
		this.mergeImg(releaseDir,projectName);
	},

	mergeImg:function(filePath,projectName)
	{
		
		fs.exists(path.join(filePath,'sprite'), function (exists) {
			
			//取出目录下所有文件夹
			var spriteFilePath = path.join(filePath,'sprite'), //sprite 文件夹
			 	dirs = mfile.getAllDirsSync(spriteFilePath),
			 	imgObj = {},
			 	jsonDir = pan.getFilePath(projectName,'json'),
			 	confJsonFile = path.join(jsonDir,'sprite.json');
				
			if(dirs.length) {
				mutil.each(dirs, function(dir, index){

					//取出相应目录下所有图片
					var imgFiles = mfile.getAllFilesSync(dir),
						spriteName = path.basename(dir); //拼接生成的文件名
					if(imgFiles.length){
						//如果文件夹下存在文件，生成拼接文件
						var x=0,y=0;
						var spriteNameDir = path.join(filePath,spriteName)+'.png';
						creatSprite(spriteNameDir,imgFiles);
						mutil.each(imgFiles,function(imgFile,imgindex){
							//开始绘制图片
							var prjConfig = require(pan.getFilePath(projectName, 'config'));
							var replace = '~/img/sprite/' +spriteName +'/'+ path.basename(imgFile) + '';
							x=x+1;
							imgObj[replace] = {path:'/img/'+spriteName+'.png',pos:'-'+x+'px 0px'};
							images(spriteNameDir).draw(images(imgFile), x, y).save(spriteNameDir);
							x=x+images(imgFile).width();
						})
					}
				})
				var str = JSON.stringify(imgObj);
				fs.writeFileSync(confJsonFile, str, 'utf8');
			}
		});
		
	}
}
function creatSprite(spriteName,imgFiles)
{
	var height=0;
	var width=0;
	mutil.each(imgFiles,function(imgFile,imgindex){
		//开始绘制图片
		var imgObj = images(imgFile);		
		width = width + imgObj.width() + 1;//每个图像有1像素间距
		if (imgObj.height()>height) {
			height = imgObj.height();
		};		
			
	})

	images(width,height).save(spriteName);
}
module.exports = sprite;