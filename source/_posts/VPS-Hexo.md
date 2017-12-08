---
title: 快速搭建 Hexo 静态博客并部署到 VPS
date: 2017-10-14 15:35:57
tags: [运维部署, Linux]
---

### 前言

折腾了许久，也算是第一次完整地在服务器上部署了一次站点，于是就想顺便把这次部署地经验通过博客总结一下。

---

### 基本技能要求

* Linux 系统下的常用基本操作命令
* Node.js 和 npm 的基本操作
* Hexo-cli 的基本操作

---

### 步骤

1. 购买一个 VPS 或者云服务器，两者的差别可以[看这里](https://www.aliyun.com/zixun/content/3_12_196634.html)
2. 在本地建立 Hexo 项目
3. 服务器配置
4. 在服务器上搭建 Git 服务器，利用 Git 服务器来实现远端部署
5. 配置 web 服务器

---

#### 购买 VPS 或云服务器

我的博客使用的是 [vultr](https://www.vultr.com/) 的境外服务器，性价比高，从 $2.5/月 - $640/月的都有，价格越贵就意味着越的内存和带宽以及越多核心的服务器，我选择的是 $5/月的套餐。

有很多节点可供选择，推荐东京和新加坡的节点，速度相对要快一些。

系统我选择的是 Centos 7，所以之后的服务器配置等操作都是基于 Centos 的。其他的 Linux 系统操作上差异不算特别大，可以自行百度，步骤都是差不多的。

国内的话选择就更多了，比如腾讯云、阿里云、百度云等等... 我之所以不用国内的主机商是因为我还需要通过我的服务器来实现“科学上网”，所以就只能选择境外的服务器啦。

Vultr 的使用非常地简单，注册好账号密码之后，先往里充值（最少 $10)，可以使用支付宝，这点非常方便，然后新建服务器实例 (instance), 一步一步按操作来就好了。

---
#### 本地搭建 Hexo 项目

![](hexo.io.png)

[Hexo](https://hexo.io/) 是一个基于 Node.js 的静态博客框架，用 markdown 来编写博客，然后通过官方的命令行工具来生成静态文件。这里简单介绍一些 Hexo 的用法：

首先安装官方提供的命令行工具（确保系统中安装了 Node.js 以及 npm）：

``` bash
npm install hexo-cli -g
```

然后在项目文件夹中运行来创建 hexo 项目：

``` bash
hexo init
```

通过 `hexo server` 命令在本地创建一个服务器，默认端口是4000，就可以预览到博客的效果。然后在本地写完 markdown 文件之后使用 `hexo generate` 来编译生成静态的 HTML/CSS/JS 文件，生成的文件在 `public` 目录下。

有了生成好的静态文件之后，我们就可以准备开始部署啦。

> 关于 Hexo 的更多用法这里就不再赘述了，可以自行阅读官方文档来学习使用更多高级的功能。

---

#### 服务器配置

##### 配置 SSH 密钥实现免密码登录

SSH(secure shell) 是我们用来登录管理服务器的一种加密协议，服务器的默认用户是 `root` 用户，因此我们使用 `ssh root@[server-ip]` 来登录服务器，这种登录方式非常麻烦，而且每次登录都需要输入密码，所以我们用一种更加简便也更安全的方法来登录服务器。

---

##### SSH 密钥认证原理简述

我们所说的 SSH 密钥通常指 SSH 密钥对，也就是一对密钥包含了一个公钥 (public key)和一个私钥 (private key)。

私钥保留在客户端，也就是我们的电脑上。私钥是极其私密的，不能暴露出去，所以要妥善保管。作为一种预防措施，可以使用口令（某种密码）来加密私钥。

而公钥则要上传到服务器，并且添加到特账户下的叫做 `~/.ssh/authorized_keys`的文件里。

SSH 密钥验证的原理简单来说就是：

1. 登陆的时候，服务器会向客户端发送一段随机的串
2. 客户端接收到之后利用自己的私钥来加密这个串并返回给服务器
3. 服务器利用公钥来解密来自客户端的加密串
4. 如果解密之后的串和一开始服务器发送出去的串是匹配的，那么这次验证就通过了。

![](ssh-key-auth-flow.png)

---

##### 生成 SSH-Key

打开终端，然后输入：

``` bash
ssh-keygen
```

然后你会看到：

``` bash
Generating public/private rsa key pair.
Enter file in which to save the key (/path/to/.ssh/id_rsa):
```

默认情况下生成的密钥会放到括号的这个默认文件中，如果你之前没有创建过同名的密钥文件的话，那么直接按回车就可以了。

如果有重名的的密钥的话，你可以手动指定密钥存放的地址，以及文件名。

然后你会看到：

``` bash
Enter passphrase (empty for no passphrase):
```

这就是我们之前提到的口令，口令相当于对密钥又做了一次加密，每次使用私钥的时候都会要求输入口令。

我们不希望每次登录还要再多输一个密码（虽然使用口令明显安全性更强），所以我们直接按下回车不使用口令。

然后你的用户根目录下的 .ssh 文件夹内就会多出两个文件，一个是 `id_rsa` 文件, 一个是 `id_rsa.pub` 文件。

默认情况下，使用 `ssh-keygen` 命令生成的密钥都是这命名的，rsa 代表了他们的加密算法是 rsa 算法，你也可以更改它们的名字，但是利用 ssh 登录的时候，就必须显式地指定密钥的路径。

---

##### 上传公钥至服务器

我们使用这段命令来上传公钥（需要进行服务器的密码验证）：

``` bash
cat ~/.ssh/id_rsa.pub | ssh [username]@[remote_host] "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

这段命令的意思就是将客户端中 `.ssh` 目录下的 `id_rsa.pub` 公钥的内容输入到服务器对应用户 `.ssh` 目录下的 `authorized_keys` 文件中。（记得将 `[]` 中的内容更换成自己服务器的用户名和地址）

然后终端会提示你输入密码，验证成功后，就成功将公钥上传到服务器上了。

额外提一点，现在大部分的服务器供应商都提供了以指定公钥创建服务器的功能，你只需要提供本地生成的公钥的具体内容就可以了。这样就不需要手动传输本地的公钥到服务器了。

``` bash
cat ~/.ssh/id_rsa.pub
```

这个命令可以输出公钥的具体内容，全部复制即可。

---

##### 无密码登录服务器

我们成功地创建了密钥并且上传到服务器之后，就可以来尝试使用密钥来登录了：

``` bash
ssh [username]@[remote_host]
```

还是使用同样的命令，但是这次服务器不会再要求你提供密码了（前提是你没有设置口令）。

如果你更改过了私钥文件名称, 那么你需要使用 `-i` 修饰符并提供私钥的具体地址：

``` bash
ssh -i [username]@[remote_host] path/to/[name]_rsa
```

否则 ssh 会默认使用 `~/.ssh/id_rsa` 来登录。

假如你有多台服务器，每台服务器都使用了不同的密钥，那么这么做就非常麻烦了。

我们可以在 `.ssh` 目录底下新建一个 config 文件, 然后在里面输入如下格式的文本：

``` bash
Host xx.xx.xx.xx
   IdentityFile ~/.ssh/[your_private_key]
```

这样就将具体的主机地址对应到具体的密钥了。

---

##### 禁止密码验证登录

既然我们已经实现了利用 SSH-Key 登录，我们就可以禁止其他用户利用密码登录服务器 shell，防止别人破解密码后进入服务器。

通过修改 `/etc/ssh/sshd_config` 文件中的 `PasswordAuthentication` 这一项，我们就可以达到禁用密码登录的目的。

``` bash
vi /etc/ssh/sshd_config
```

在编辑模式中改为：

``` bash
PasswordAuthentication no
```

然后保存退出。

我们更改了配置文件所以要重启服务才能生效, 在 Centos 7 下的命令是：

``` bash
systemctl restart sshd.service
```

---

##### 安装 Node.js 以及 NPM

如果你使用其他的程序比如 PHP 来托管你的静态博客，那么你可以跳过这一段。我使用 Node.js 来为我的静态博客提供服务端托管，所以我需要使用 Node.js 以及 Npm。

利用 ssh 登录服务器，然后输入：

``` bash
// Node.js 6.x LTS 版本
curl --silent --location https://rpm.nodesource.com/setup_6.x | sudo bash -
// Node.js 8.x 版本
curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -
```

由于我们使用的 Centos 7，可以使用自带的包管理工具 yum 来安装:

``` bash
sudo yum -y install nodejs
```

其他的安装方式请参考：[Node 官网](https://nodejs.org/en/download/current/)

Node.js 自带 npm 工具，所以不必额外安装，执行完上述安装过程之后，检查一下是否安装成功：

``` bash
// 查看 node 版本
node --version
// 查看 npm 版本
npm --version
```

如果能够成功地看到版本号，说明安装成功了。

---

#### 在服务器上搭建 Git 服务器

我们都知道利用 Git 来实现代码库的版本控制。其实，远程仓库和本地仓库没有什么不同。所以我们可以在自己的服务器上搭建一个 Git 服务器来作为我们的私有仓库。

这样我们就可以很方便地利用 Git 来更新我们的代码到服务器，而不用手动地上传文件。

---

##### 第一步，安装 Git

``` bash
sudo yum install git
```

---

##### 第二步，创建 Git 专用账户

``` bash
sudo adduser git
```

---

##### 第三步，配置 SSH-Key

由于我们之前已经配置好了，所以我们只需要将同样的公钥复制到 `/home/git/.ssh/authorized_keys` 中。

> 使用了 `adduser` 命令创建了用户之后，会在根目录的 `home` 目录底下生成同名的文件夹

---

##### 第四步，初始化 Git 仓库

我们先创建一个用来存放博客 Git 仓库以及最终编译的静态文件的目录：

```
sudo mkdir -p /blog/git && sudo mkdir -p /blog/www
```

这样我们就在系统根目录创建了 blog 目录，底下有 git 和 www 两个子目录。前者用于存放 Git 仓库，后者用来存放我们博客网站的静态文件。

然后我们将 blog 目录的 owner 改为 git 用户：

``` bash
sudo chown -R git:git /blog
```

这样 git 用户就拥有了 blog 目录以及其子目录的读写权限。

我们将 Git 仓库设定为 `/blog/git/blog.git`, 在 /blog/git/ 目录下输入：

``` bash
sudo git init --bare blog.git
```

这样我们就创建了一个没有工作区的 Git 仓库，没有工作区就意味着用户无法再服务器上去修改工作区的代码。

---

##### 第五步，使用 Git-Hooks 来实现自动部署

Git 可用通过 hook 来实现某种行为触发的时候执行自定的脚本，也就是说我们可以在 push 命令触发的时候执行一段自定的脚本来实现自动部署。

``` bash
cd /blog/git/blog.git/hooks
```

我们进入 blog.git 目录下的 hooks 目录，然后创建 `post-receive` 文件：

``` bash
cat > post-receive
```

然后输入：

``` bash
#!/bin/sh
git --work-tree=/blog/www --git-dir=/blog/git/blog.git checkout -f
```

输入完之后按下 `control + d` 保存文件。

这样我们就创建了 `post-receive` 这个 hook，在我们每次从本地 push 到远程仓库的时候，就会触发这个 hook，并执行里面的脚本。

这段脚本的意思就是，会将 `--git-dir` 对应的仓库强制检出然后把工作区设置在 `--work-tree` 对应的目录底下。

这样我们就可以将之前的工作区的代码传输到 `/blog/www` 目录下，实现了远程自动部署。

我们还需要给予这个脚本可执行的权限 (捣腾 linux 就要捣腾各种权限)：

``` bash
chmod +x post-receive
```

---

##### 第六步，禁用 git 用户 shell 登录

处于安全考虑，我们只希望用 git 用户来操作 git 仓库，不希望用它来登录服务器。

``` bash
vi /etc/passwd
```

在编辑模式下，找到 `git:x:1001:1001:,,,:/home/git:/bin/bash` 这一行

将其改为 `git:x:1001:1001:,,,:/home/git:/usr/bin/git-shell` 然后保存并退出编辑模式。

这样我们就指定了 git 用户只能通过 ssh 来使用 git-shell, 而无法登录使用 shell 来操作服务器。

---

##### 第七步，设置本地仓库

``` bash
exit
```

退出服务器的 shell, 然后进入之前我们创建好的本地的 hexo 项目下。

我们只需要将生成的静态文件 push 到我们服务器上的 Git 仓库。

所以我们进入到本地 hexo 项目下，先执行 `hexo generate` 生成 `publish` 目录。

然后初始化本地 Git 仓库并设置远端地址：

``` bash
git init
git remote add [remote_name] ssh://[username]@[remote_host]/blog/git/blog.git
```

> 记得将 `[]` 内的内容改成自己的对应内容

之后在本地更新了博客的 markdown 文件之后，只需要重新执行一次 `hexo generate`

就可以重新编译生成静态文件并添加和覆盖 `publish` 目录内的内容

然后就可以利用 `git push [remote_name]` 命令来直接将编译好的静态文件自动部署到服务器的 `/blog/www` 目录下啦。

---

#### 配置 web 服务器

终于来到我们最后也是最为关键的一步。

在本例中，我们使用 Node.js 来开启我们的 web 服务器。

---

##### 开启服务器的 80 端口

我们在浏览器中访问服务器的 ip 地址或者是对应的域名时，http 协议默认访问 80 端口，所以我们要先开启服务器的 80 端口。

这一步我们需要更改防火墙的规则，在 Centos 7 下，默认防火墙是 firewall ：

``` bash 
firewall-cmd --add-port=80/tcp --permanent
```

这样我们就开放了 80 端口，然后重载防火墙：

``` bash
firewall-cmd --reload
```

如果看到 `success` 则说明生效了。

---

##### 添加服务器脚本

我们选择基于 Node.js 的 `express` 框架来搭建我们的 web 服务器。

我们在本地 Hexo 项目下新建 `index.js` 文件，然后输入:

{% codeblock lang:js %}
const Express = require('express')
const app = Express()
app.use(Express.static('public'))
app.listen(80)
{% endcodeblock %}

保存，然后在 git 仓库中提交并 push 到远端仓库。

---

##### 安装 PM2 以及 Express 模块

通过 ssh 登录服务器 shell，然后全局安装 PM2 模块：

``` bash
npm install -g pm2
```

然后进入 /blog/www 目录下，安装 web 服务器所需要的 express 模块：

``` bash
npm install express
```

---

##### 启动 web 服务器

在刚才的目录下，也就是 `index.js` 所在的目录下输入：

``` bash
pm2 start index.js
```

看到 pm2 输出的进程信息，并显示 `online` 状态则说明服务器启动成功。

然后打开浏览器，在地址栏输入服务器的 ip 地址或者绑定的域名，就可以看到你的静态博客啦。

---






