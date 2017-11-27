---
title: Hexo 博客工作流的构建
date: 2017-11-27 18:27:07
tags: [运维部署, 工作流, Linux, 工程化]
---

记得之前用 wordpress 写博客，无脑而省心，不需要担心任何的发布的问题

如今博客已经全面迁移到了 Hexo 上，就需要一些工作流来简化博客的**编译**、**打包**乃至**部署**的过程

## 需求分析

根目录

```
├── deploy.sh
├── hexo
├── index.js
├── node_modules
├── package-lock.json
├── package.json
└── public
```

根目录下 hexo 目录

```
├── _config.yml
├── db.json
├── gulpfile.js
├── node_modules
├── package-lock.json
├── package.json
├── scaffolds
├── source
└── themes
```

这是我博客的根目录，也是最终部署到服务器上的目录

最后只会把除了 `hexo`，`node_modules`，`deploy.sh` 以外的文件部署到服务器上

但是用过 hexo 的同学都知道，在新建的 hexo 项目的时候，会自动生成一个 hexo 目录，里面包含了必要的文件夹以及源码

我们没有必要强行去改动 hexo 目录结构，而且 hexo 的命令都必须要在这个目录下才能执行

其次，每次 `hexo generate` 来生成静态文件的时候，生成的 `public` 文件夹都处于 hexo 目录之内

然后我的 hexo 目录里是 github 的本地仓库，根目录下是服务器的 git 本地仓库

所以就诞生了以下一些需求：

* hexo 编译生成静态文件之后移动 public 文件夹到根目录
* 去除发布目录中不必要的文件（只保留压缩的文件）
* 将根目录的发布文件 push 到服务器上
* 服务器进程自动 reload

**这些需求之前都是手动去实现的，非常繁琐，作为一名攻城狮，把这些复杂繁琐的任务交给机器来做，是理所必然的**

## 利用 gulp 实现自动化构建

虽然现在前端都进入到利用 webpack 来打包的时代了，但是 gulp 依然有自己的实用之处

对于高度自定义的构建流程，webpack 用起来就没那么方便了，但是 gulp 就可以实现高度的自定义任务

gulp 的安装和使用，这里就不详细阐述了，然后需要在你执行 gulp 命令的目录内新建一个 `gulpfile.js`

在这个文件内，你就可以编写你的 gulp 任务流程了，直接上代码：

```js
const gulp = require('gulp')
const del = require('del')

// 把 hexo 目录内的 public 文件夹拷贝到外层根目录
// 并且排除一些不需要拷贝的文件
gulp.task('copy', function() {
  return gulp.src([
    'public/**/*',
    '!public/**/*.map',
    '!public/**/*.scss',
    '!public/**/*[!min].js',
    '!public/**/*[!min].css'
  ])
    .pipe(gulp.dest('../public'))
})

// 拷贝完了之后，删除 hexo 目录下的 public 文件，这样就不会被 git 所记录
gulp.task('deleteInnerPublicFolder', ['copy'], function(cb) {
  del.sync('public', {
    // delete the folder outside the cwd
    force: true
  })
  cb()
})

gulp.task('build', ['deleteInnerPublicFolder'])
```

值得注意的是，gulp 本身包括它的很多插件都使用 `glob` 模式来做文件匹配，也就是类似于 `public/**/*.scss` 的语法，很像正则表达式，但是比正则表达式要简单许多，具体可以参考 [node-glob](https://github.com/isaacs/node-glob) 这个库

gulp 可以通过 task 的编写来将构建流程按照一定的顺序来执行，就像几根用阀门控制的水管一样，每个阀们都控制着一个不同的流程

对于我的博客来说，因为 css 和 js 都是压缩过的，所以就不需要再利用 gulp 去压缩了

## 利用 shell 脚本实现自动部署

gulp 已经帮我们做了最复杂的一步，剩下的都是简单的步骤

那么我们是否可以实现诸如一键部署这样的功能呢？

答案是肯定的，我们只需要编写简单的 shell 脚本就可以完成这个任务了

在编写脚本命令之前，你最好熟悉 linux 的常用命令

``` bash
#! /bin/bash
echo -e "\n===================================================================\n"
echo -e "Start generating static files ...\n"

// 脚本从根目录执行，首先进入 hexo 目录，然后执行 hexo generate 生成静态文件
cd hexo && hexo generate

echo -e "\nDONE !\n"


echo -e "\n===================================================================\n"
echo -e "Start executing gulp tasks ...\n"

// gulpfile 和 gulp 的依赖也都在 hexo 目录下，直接运行 gulp 的命令
gulp build

echo -e "\nDONE !\n"

echo -e "\n===================================================================\n"
echo -e "Start pushing production files to remote server ...\n"

// 执行完 gulp 命令之后回到根目录，利用自动 git 命令来将文件推送到服务器
// 服务器的 git 仓库只用作传输作用，所以对 commit message 没有严格的要求
// 如果想要每次都严格填写自定义的 commit message 可以利用 shell 的输入变量
cd ../

git add -A

git commit -m "push production files"

git push production master

echo -e "\nDONE !\n"

echo -e "\n===================================================================\n"
echo -e "Start reloading the web server ...\n"

// 利用 ssh 来远程 reload web 服务器（我的服务器使用的是 Node.js，用 pm2 来管理进程）
// 这里的 0.0.0.0 代表你服务器真实的 ip 地址
ssh root@0.0.0.0 "pm2 reload blog"

echo -e "\nDONE !\n"
```

你会发现，我使用了大量的 `echo` 命令，这是因为我想让整个执行过程能清晰地看到每个流程，所以使用了大量的分隔符

这样我们实现了输出良好的 shell 脚本，是不是很简单？

最后，在根目录的 package.json 中加上，执行整个脚本的 npm script

``` json
"scripts": {
    "deploy": "./deploy.sh"
}
```

这样我们在写完 hexo 的 markdown 文件之后，只需要在根目录下执行 `npm run deploy`

就可以一键自动完成 hexo 编译、文件移动、文件删除、自动部署、服务器重载等功能了

的确是省去了大量繁琐的操作，因此能自动化的我们都尽量去实现自动化，能为我们节省大量的宝贵时间


## 总结

利用 gulp + shell 脚本我们就能够做到高度自定义的构建流程，假如我们在复杂的项目中再利用上 webpack 等工具呢？

想象力是无限的，生产力也都是可以解放的