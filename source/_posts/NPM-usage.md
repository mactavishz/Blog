---
title: NPM 的用法
date: 2017-10-16 17:01:25
tags: [前端工具]
---

## NPM是什么

请思考一个问题，当我们有大量的重复需求需要解决的时候，常常会使用相同的技术，那么我们如何来分享这些技术呢？在前端领域，最简单的方法就是互相分享编写好的js代码，里面有大量的函数便于我们调用，我们把这种具有解决某些特定问题的能重复使用的JS代码叫做模块

> 包(package)其实就是一些JS模块组织到一起，放到一个目录里。

npm就是一个包管理器，npm把大量的包托管在它的平台上，便于开发者上传、下载、修改、更新包。

总之现在的前端开发，已经不需要你重复地造轮子，去实现那些重复的功能，你只需要利用好npm，下载具有相应功能的包，并使用他们，你也可以编写一些自己的npm包，分享给他人使用，npm的包之繁多，超乎你的想象。

{% asset_img npm.png %}

## NPM官网

[https://www.npmjs.com/](https://www.npmjs.com/)


在npm的官网，你就能直接搜索你想了解的包，点进去可以查看相应包的安装和简单的使用方法，以及该包的Github地址和作者信息等等

{% asset_img express.png %}

> 注意: 包与包之间可以是互相依赖的，一个包可能依赖于其他很多个包，并不是说每个包都是单独的，理解这个概念很重要，因为当我们在开发一个webApp的时候，也可能需要使用很多的包

## 更新NPM

虽然Node.js的较新版本会帮你安装好npm，但是npm自身的更新要比Node.js更加频繁，我们当然想保证自己电脑上的npm处于一个最新版本。运行以下命令来更新:

``` bash
npm install npm@latest -g
```

### 利用NPM来安装模块

注意：当我们谈论到安装的时候，有两种方式，一种是**全局安装**，一种是**本地安装**。

如果你在开发的过程中经常需要安装一些模块，并且通过 require 或者 import 来使用，那么我推荐使用**本地安装**

如果你需要经常要在命令行里面使用这个模块，或者说把他们当做一个命令行工具，那么我推荐你**全局安装**

## NPM常用命令

### 全局安装

当你执行全局安装命令的时候，无论你的命令行当前目录是在哪儿，效果都是一样的:

``` bash
npm install < 包名 > -g
```

-g 也可以写作 --global

### 本地安装

接着我们来本地安装一个包，比如 axios

``` bash
npm install axios
```

本地安装的时候，请务必先利用cd命令进入到要安装的目录下，而不要直接运行

npm install &lt; 包名 &gt; ，首先这是个不好的习惯，其次直接运行这个命令npm会把包

安装在他的本地默认模块文件夹下，有时候会和你其他的本地目录的模块发生冲突

> 在Mac OS，本地安装会默认安装在 /user/你的用户名/node\_modules 文件夹下。
> 如果你已经这么做了，那么把本地默认安装的文件夹删除即可

## 关于 package.json

管理本地模块最好的方式就是创建一个package.json文件

使用package.json文件有以下这些好处：

1. 它可以作为你的项目的产品说明书，阐明了你的项目依赖于哪些模块
2. 它还能允许你指定你的项目所使用的模块的版本号
3. 它增强你项目的复用性，便于和其他开发者分享

### 创建package.json

package.json一般只存在于项目根目录下，在命令行中输入以下命令来创建：

```bash
npm init
```
接着按照命令行中的提示，依次输入项目的相关信息，注意：

* name 属性必须全部为小写字符，不能有空格，可以有短横线或者下划线
* version 属性的格式为 x.x.x
* name 和 version 是必需的两个属性，你的 package.json 至少要包含他们

如果你不想一个一个地去填写这些属性，可以使用 --yes 或者 -y 修饰符

``` bash
npm init --yes
```
这样 npm 会提取你的项目文件信息并帮你自动生成一个带有默认信息的 package.json 文件

#
## package.json 文件示例

一个比较完整的package.json文件如下：

``` json
{
  "name": "project",
  "version": "1.0.0",
  "author": "张三",
  "description": "第一个node.js程序",
  "keywords":["node.js","javascript"],
  "repository": {
  "type": "git",
  "url": "https://path/to/url"
  },
  "license":"MIT",
  "bugs":{"url":"http://path/to/bug","email":"bug@example.com"},
  "contributors":[{"name":"李四","email":"lisi@example.com"}],
  "scripts": {
  "start": "node index.js"
  },
  "dependencies": {
  "express": "latest",
  "mongoose": "~3.8.3"
  },
  "devDependencies": {
  "grunt": "~0.4.1",
  "grunt-contrib-concat": "~0.3.0"
  },
  "homepage": "https://github.com/ashleygwilliams/my_package" 
}
```

我们来看看package.json里的字段的含义：

* name : 必需字段，当前项目文件夹的名称
* version : 必需字段，第一次创建时总是1.0.0
* description : 可选字段，描述
* main : 可选字段，指定了模块加载的入口文件，当用户调用require('模块名')就会加载这个文件，默认是根目录下的index.js，
* keywords : 可选字段，关键字
* license : 可选字段，遵守什么样的协议（大部分开源的模块都遵守MIT协议）
* hompage : 可选字段，模块的官方网站
* author : 可选字段，作者
* bugs : 可选字段，一般是问题追踪的url或者邮箱
* contributors : 可选字段，代表该模块的贡献者信息
* repository : 可选字段，代表模块的仓库地址
* dependencies : 可选字段，里面列出当前你的项目在**生产环境**下依赖的模块
* devDependencies :可选，里面列出当前你的项目在**开发和测试环境**下依赖的模块
* scripts : 可选，脚本说明对象，主要被 npm 用来编译、测试模块，所有node_modules/.bin目录下的命令，都可以用 npm run [命令] 的格式运行

### --save 和 --save-dev install命令修饰符

既然有了package.json这么方便的东西，那么我们就可以利用它来自动帮我们在安装模块时写入模块依赖信息

当我们要安装**生产环境**需要使用模块时，我们使用：

``` bash
npm install < 模块名 > --save
```

当
我们要安装**开发和测试环境**需要使用模块时，我们使用：

``` bash
npm install < 模块名 > --save-dev
```

我们来试一下，现在我们再给我们之前的项目安装一个webpack，用于测试环境

``` bash
npm install webpack --save-dev
```

安装完成之后，我们会发现package.json下多出了 devDependencies 字段

``` json
  "devDependencies":  {
  "webpack": "^2.3.2"
  }
```

### 项目的转移和交接

有时候我们在多人协作共同开发一个项目的时候，可能每个人都需要负责不同的部分的代码编写，那么我们如何来共享整个项目文件呢

有了 package.json 就方便多了，正常情况下，我们只需要把源码文件和package.json一起打包给对方就可以了，请忽略node_modules文件夹，往往里面的文件过于繁多，不利于我们转移交接。

当你拿到源码和 package.json 的时候，只需要用命令行工具 cd 进入项目文件夹根目录

接着输入以下命令

``` bash
npm install
```
这时候 npm 就会根据 package.json 中描述的依赖列表来依次安装项目所需要的模块

如果你的项目是可以直接运行的，那么请查看 package.json 里的 scripts 字段，来运行相应命令

> 更多关于 Package.json 请查看 https://docs.npmjs.com/files/package.json

### NPM 常用命令

* npm ls 列出当前目录安装的模块 [-g]查看全局
* npm uninstall < 包名 > 删除模块 [-g] 删除全局模块
* npm update < 包名 > 更新模块 [-g]
* npm -l 查看npm各个命令的简单用法
* npm init 初始化并创建 package.json [--y]使用默认参数
* npm outdated 检查模块是否过期 [-g]检查全局模块

> 更多命令请查看 https://docs.npmjs.com/all