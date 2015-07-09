#!/usr/bin/env node
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var spawn = require('child_process').spawn;

var program = require('commander');


program
    .command('init')
    .description('初始化项目')
    .action(function(){
        run('pandorajs init -s no', null, function(){
            //Pandora初始化完成
            var fpath = path.dirname(__dirname);
            var flist = fs.readdirSync(path.join(fpath, 'demo'));
            console.log('正在初始化...');
            flist.forEach(function(f) {
                // console.log(path.join(process.cwd(), f));
                if(f.indexOf('.') == 0){
                    return;
                }
                fse.copySync(path.join(fpath, 'demo', f), path.join(process.cwd(), f));
            });
        });
    });

program
    .command('publish <project>')
    .description('发布项目\t\tusage:publish  项目名称')
    .action(function(project) {
        var prjPath = path.join(process.cwd(),'Sites', project);
        if(!fs.existsSync(prjPath)){
            console.log('未找到站点（'+prjPath+'）,请在项目根目录下操作');
            process.exit(1);
        }
        global.$siteRoot = process.cwd();

        var prjCfg = require('../lib/compiler').getProjectCfg(project);
        var release = require('../lib/release.js', prjCfg);

        release.releaseProject(project, prjCfg.mode || 'common');
    });


program.parse(process.argv);

if (!process.argv.slice(2).length) {
    console.error('你没有输入任何命令，是否想输入`astro init`?\n你可以通过 astro -h 获得更信息');
}

function run(command, opt, cb) {
    var parts = command.split(/\s+/);
    var cmd = parts[0];
    var args = parts.slice(1);
    var proc = spawn(cmd, args, {
        stdio: 'inherit'
    });
    proc.on('close', function(code) {
        if(!cb){return;}
        if (code !== 0) {
            cb(new Error('Command exited with a non-zero status'));
        } else {
            cb(null);
        }
    });
}