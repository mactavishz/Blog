---
title: 在 Vue 中使用 Ajax 的几种姿势
date: 2017-11-24 22:52:22
tags: [Vue, JavaScript]
---

作为一名前端开发人员, 使用 Vue 也有一段时间了, 刚好有时间来总结一下在 Vue 中使用 Ajax 的一些方式

不同的方式有各自的优点和缺点, 这篇文章将会简单地阐述一下

## 主要的几种方式

1. 注入 Vue 根实例
2. 组件中直接使用
3. 利用 Vuex 中的 actions
4. Vue-router 路由导航守卫

### 注入 Vue 根实例

记得 Vue 刚发布 2.0 的时候, 那时候还有一个挺活跃的库, 叫做 [vue-resource](https://github.com/pagekit/vue-resource), 这个库一度曾作为 Vue 的官方推荐的核心插件来使用, 到后来社区中出现了更多好用的 Ajax 库, Vue 作者也觉得没有必要将 Ajax 的功能集成进 Vue 当中, 所以一般我们都会使用第三方的 Ajax 库来做 Http 请求。

那么主要的一种方式就是, 将第三方的 Ajax 库注入到 Vue 的根实例当中

``` js
const Axios = require('axios')
const Vue = require('vue')

Vue.prototype.$http = Axios
```

这样我们就能在其 Vue 实例的作用范围内, 直接使用：

``` js
new Vue({
  // ...
  methods: {
    fetchData() {
      this.$http.get('/url').then(({data}) => {
        this.myData = data
      })
    }
  }
}).mount('#app')

```

这样做的 **好处**：

* 在组件中保持一致的 ajax 逻辑
* 不必在组件中反复引入 ajax 库,专注界面和业务逻辑

这样做的 **缺点**：

* 使得 Vue 实例对象变得更加庞大和复杂, 增加了应用的开销


## 在组件中直接使用

这种方式使得每个组件负责管理自己的 Ajax 请求

一般情况下, 我们可能会使用一些容器组件来包裹具体的组件, 然后在容器组件中包含 Ajax 逻辑, 在具体的组件中管理数据

``` js
new Vue({
  template: '<div><child :ajaxData="myData"></child></div>',
  data() {
    return {
      myData: null
    }
  },
  methods: {
    ajaxRequest() {
      //...
    }
  }
})

Vue.component('child', {
  template: '<div>got data {{ajaxData}}</div>',
  props: ['ajaxData']
})
```

我们甚至可以将一下通用的方法抽出到 mixin 当中以达到复用的目的

这样做的 **好处**：

* 降低组件之间的耦合, 增强组件的复用性
* 更好地控制获取数据的时机

这样做的 **缺点**：

* 增加了组件之间数据沟通的成本
* 组件可能承载过多的职责, 职能容易产生重复


## Vuex Actions

利用 Vuex 的 actions 我们可以将业务逻辑和请求写在同一个方法里

并且加上一定的异步流程控制, 通常是使用 promise 或者 async function

``` js
store = new Vuex({
  state: {
    //...
  },
  actions: {
    getData({commit}) {
      return new Promise(resolve => {
        axios.get('/url').then(({data}) => {
          commit('updata', data)
          resolve()
        })
      })
    }
  }
})
```

这种方法使得界面和业务大大地解耦, 开发起来也很舒心, 如果你已经在使用 Vuex, 那么相信你一定会喜欢上这种方式

这样做的 **好处**：

* 使得组件专注于表现层，不用再写各种自定义事件和 props

这样做的 **缺点**：

* 加重了状态管理的负担，引入了更多的复杂度


## 路由导航守卫（Route navigation guards）

你一定觉得这个名词非常奇怪, 其实 vue-router 的官方中文文档就是这么翻译的

这种方式将会将 Vue app 划分成不同的页面, 当路由发生变化的时候, 就获取不同的数据

路由可以更好地控制数据获取的时机, 如果是每个子组件都有自己的数据获取, 那么数据到达的时机可能会显得非常凌乱

在 vue-router 中, 可以给每个页面都设置一个通用的全局导航守卫 `beforeRouteEnter`

``` js
import axios from 'axios'

router.beforeRouteEnter((to, from, next) => {
  axios.get(`/api${to.path}`).then(({ data }) => {
    next(vm => Object.assign(vm.$data, data))
  })
})
```


这样做的 **好处**：

* UI 的变化变得更加好预测了

这样做的 **缺点**：

* 可能会减慢页面加载的速度, 因为在数据没有准备好之前, UI 将无法呈现
* 如果你根本就不打算使用路由, 那么就没它什么事儿了


## 总结

以上就是几种常见的在 Vue 中使用 Ajax 的方式, 不能说哪一种就是最好的, 实际运用还需要结合项目的实际情况, 选择最适合的才是最好的。

> 参考： 

> * https://vuejsdevelopers.com/2017/08/28/vue-js-ajax-recipes/?jsdojo_id=medium_var

> * https://router.vuejs.org/zh-cn/advanced/navigation-guards.html

> * https://vuex.vuejs.org/zh-cn/actions.htmls