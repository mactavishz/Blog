---
title: ES2017 中的 Async function
date: 2017-11-28 23:27:44
tags: [Javascript]
---

在没有 Promise 之前的时代，在 JS 中写 callback 简直是一种痛苦的煎熬

比如我们要下载一个文件，下载完成之后需要在成功的回调函数里去读写文件

抽象的代码如下：

``` js
function processData(url) {
  downloadFile({
    //... networking
    success: function(data) {
      readFile(data, function(err, file) {
        if(!err) {
          file.write(function(data) {
            //... write file
          })
        }
      })
    }
  })
}
```

这样的代码我们称作 `"callback hell"`，回调函数可以是无尽的深渊，那么维护起来会相当困难，简直不要太考验工程师的眼力

那么 ES2015 引入了 Promise 之后，回调函数的写法有了挺大的改善

我们可以利用 Promise 对上面的代码稍加改造:

``` js
function processData(url) {
  return new Promise((resolve, reject) => {
    downloadFile({
      success: resolve
    })
  })
}

processData.then(data => {
  return new Promsie((resolve, reject) => {
    readFile(data, (err, file) => {
      if (err) {
        reject(err)
      } else {
        resolve(file)
      }
    })
  })
}).then(file => {
  file.write(function(data) {
    //... write file
  })
}).catch(err => {
  console.error(err.message)
})
```

这样我们使得代码的可读性变得更强了，也更好维护了，但是依然避免不了要在 Promise 中写回调函数的问题

这时候 ES2017 又推出了更好的解决方案，那就是 `Async Function`