<template>
  <div id="app">
    <van-nav-bar
        v-show="shownav"
        :title="title"
        left-arrow
        fixed
        @click-left="$router.back()"
    />
    <!-- <div v-show="$route.name != 'home' && $route.name != 'listWithType'" @click="$router.back()" class="back-btn"><img src="./assets/back.png" srcset="./assets/back@2x.png 2x, ./assets/back@3x.png 3x"/></div> -->
    <div v-show="shownav" class="nav-placeholder"></div>
    <DebugBoard v-show="showDebug"/>
    <router-view/>
  </div>
</template>
<script>
import { mapActions, mapMutations, mapState} from 'vuex'
// import {getCurrentBTYAddress} from '@/libs/jsBridge.js'
import {getCurrentBTYAddress} from '@/libs/dsBridge.js'
import DebugBoard from './components/DebugBoard.vue'

let timer = null

export default {
  components: {
    DebugBoard
  },
  data() {
    return {
      title: '激励'
    }
  },
  methods: {
    ...mapActions(['getContractAddress','getBalance', 'listUnfreezeByCreator', 'listUnfreezeByBeneficiary','getBlockTime']),
    ...mapMutations(['updateAddress']),
    changeTitle (route) {
      this.title = route.meta.title
    },
    pollingTime () {
      // 5 秒更新一下区块时间
      this.getBlockTime().then(() => {
        timer = setTimeout(() => {
          this.pollingTime()
        }, 5000);
      })
    }
  },
  computed: {
    ...mapState(['showDebug']),
    shownav () {
      return this.$route.meta.needNav
    }
  },
  watch: {
    '$route' (v) {
      this.changeTitle(v)
    }
  },
  mounted () {
    // 获取 unfreeze 地址
    this.getContractAddress().then(()=>{}).catch(e => {
      this.$notify(`${e}`)
    })

    getCurrentBTYAddress().then(address => {
      this.updateAddress(address)
      this.getBalance()
      this.listUnfreezeByCreator()
      this.listUnfreezeByBeneficiary()
    })
    this.changeTitle(this.$route)
    this.pollingTime()
  },
  beforeDestroy () {
    clearTimeout(timer)
  }
}
</script>
<style scoped>
.info-board {
  position: fixed;
  top: 40px;
  left: 0;
  font-size: 12px;
  color: #b4c5ff;
  text-align: left;
  padding: 6px;
  background-color: rgba(255, 255, 255, .4);
  border: 1px solid #0b163c21;
  z-index: 1;
  transform: scale(.8);
}
.back-btn{
  position: fixed;
  top: 6px;
  left: 6px;
  z-index: 1;
  background-color: #fdfdfd8f;
  width: 20px;
  text-align: center;
  padding: 6px;
  border-radius: 20px;
  cursor: pointer;
}
.back-btn img{
 vertical-align: bottom;
 margin-left: -2px;
}
</style>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.nav-placeholder{
  width: 100%;
  height: 44px;
}
</style>
