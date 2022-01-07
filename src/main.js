import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import filters from '@/libs/filters'
import storageList from '@/libs/storageList.js'
import VueClipboard from 'vue-clipboard2'
import '@/assets/base.css'
import '@/assets/vant-reset.css'

import {
  Toast,
  Notify,
  Dialog, Button,
  Cell,
  CellGroup,
  Field,
  Tab,
  Tabs,
  Tabbar,
  TabbarItem,
  Tag,
  PullRefresh,
  List,
  Icon,
  Loading,
  NavBar,
  DropdownMenu,
  DropdownItem,
  DatetimePicker,
  Popup,
  Switch,
} from 'vant'

Vue.use(Toast)
  .use(Notify)
  .use(Button)
  .use(Dialog)
  .use(Cell)
  .use(CellGroup)
  .use(Field)
  .use(Tabbar)
  .use(TabbarItem)
  .use(Tag)
  .use(PullRefresh)
  .use(List)
  .use(Icon)
  .use(Loading)
  .use(Tab)
  .use(Tabs)
  .use(DropdownMenu)
  .use(DropdownItem)
  .use(DatetimePicker)
  .use(Popup)
  .use(NavBar)
  .use(Switch)

Vue.use(VueClipboard)

// global filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])  //注册全局filter；
})

Vue.prototype.$storageList = storageList

Vue.config.productionTip = false

// router.beforeEach((to, from, next) => {
//   next()
// })

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
