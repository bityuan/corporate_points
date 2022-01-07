import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Create from './views/Create.vue'
import Detail from './views/Detail.vue'
import List from './views/List.vue'
import payRecord from './views/payRecord.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: '激励', needNav: false }
    },
    {
      path: '/modify',
      name: 'modify',
      component: Create,
      meta: { title: '发起激励', needNav: false }
    },
    {
      path: '/list',
      name: 'list',
      component: List,
      meta: { title: '激励', needNav: false }
    },
    {
      path: '/list/:type',
      name: 'listWithType',
      props: true,
      component: List,
      meta: { title: '激励', needNav: false }
    },
    {
      path: '/view/:txhash',
      name: 'view',
      props: true,
      component: Detail,
      meta: { title: '合约详情', needNav: false }
    },
    {
      path: '/payRecord',
      name: 'payRecord',
      component: payRecord,
      meta: { title: '本地支付记录', needNav: true }
    },
    {
      path: '*',
      redirect: '/'
    },
  ],
  scrollBehavior () {
    return { x: 0, y: 0 }
  }
})
