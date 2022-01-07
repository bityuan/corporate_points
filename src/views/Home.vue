<template>
  <div class="home">
    <Slogen class="home-slogen"/>
    <van-button type="primary" size="large" class="mb30 btn-home" @click="jumptocreate">发起激励</van-button>
    <van-button type="primary" size="large" class="btn-home" @click="jumptodetail">我的激励</van-button>
  </div>
</template>

<script>
// @ is an alias to /src
import Slogen from '@/components/Slogen.vue'
import { PAY_RECORD , createRecord } from '@/libs/storageList.js'

export default {
  name: 'home',
  components: {
    Slogen
  },
  methods: {
    jumptocreate () {
      this.$router.push('/modify')
    },
    jumptodetail () {
      this.$router.push('/list/1')
    },
  },
  mounted () {
    
    // 如果有记录优先跳入列表
    const myUnfreeze = this.$storageList.data[PAY_RECORD].find(item => /importUnfreeze/.test(item.a))
    if (myUnfreeze) {
      this.$router.push('/list/1')
    } else if ( this.$storageList.data[PAY_RECORD].find(item => /createUnfreeze/.test(item.a)) ) {
      this.$router.push('/list')
    }
  }
}
</script>
<style scoped>
.home{
  min-height: 100vh;
  background-image: url('../assets/bg_home.png');
  background-size: 100% 100%;
  overflow: hidden;
  padding-left: 47px;
  padding-right: 47px;
}
.home-slogen{
  margin: 125px auto 174px;
}

.home .btn-home{
  width: 280px;
  height: 44px;
  background: linear-gradient(143deg, #FF7722 0%, #FE420F 100%);
  border-radius: 25px;
}
</style>

