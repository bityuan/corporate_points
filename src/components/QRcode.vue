<template>
  <div :class="['mask',{'active': show}]">
    <div class="mask-content">
      <div class="header">
        <span>{{title}}</span>
        <div class="x-icon" @click="$emit('close')">
          <img src="@/assets/x.png" srcset="@/assets/x@2x.png 2x, @/assets/x@3x.png 3x" alt="">
        </div>
      </div>
      <div class="qrcode">
        <qrcode v-if="txhash" :value="codeContent" :options="{ width: 400 }" tag="img"></qrcode>
      </div>
      <slot name="tips"></slot>
      <section class="tc">
        <div class="tip" v-if="showScanBtn" @click="doScan">扫描冷钱包签名后地址</div>
        <slot name="title"></slot>
      </section>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import scan from '@/libs/scan'
import { urlQuery } from '@/libs/helper'

let VueQrcode = require('@chenfengyuan/vue-qrcode').default

Vue.component(VueQrcode.name, VueQrcode);

export default {
  props: ['txhash', 'show', 'notNeedSend', 'title', 'showScanBtn'],

  computed: {
    codeContent () {
      const url = this.$store.state.sendUrl;
      const txhash = this.txhash
      if (this.notNeedSend !== undefined){
        return txhash
      }
      return `${url}&${txhash}`
    }
  },
  methods: {
    doScan() {
      scan().then((res) => {
        const txhash = urlQuery('txhash', res)
        const ip = urlQuery('ip', res)
        this.$router.push({ path: 'sendtx', query: { txhash, ip }})
      }).catch((e) => {
        this.$notify(e)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.mask{
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0;
  background-color: rgba(0, 0, 0, .7);
  z-index: -1;
  transition: all .3s;
  display: flex;
  justify-content: center;
  align-items: center;
  &.active {
    z-index: 99;
    opacity: 1;
  }
}
.mask-content{
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background-color: #fff;
  .header{
    position: relative;
    text-align: center;
    line-height: 50px;
    height: 50px;
    background: #F6F6F6;
    color: #333649;
    font-size: 0.45rem;
    font-weight: 600;
  }
  .x-icon{
    position: absolute;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    top: 50%;
    margin-top: -16px;
    right: 11px;
    width: 32px;
    height: 32px;
    & > img {
      width: 70%;
      height: 70%;
    }
  }
}
.mask-content p {
  text-align: left;
  margin: 6px;
}
.qrcode{
  text-align: center;
  padding: 15px 0px;
  & img {
    width: 6.6rem;
    height: 6.6rem;
  }
}
.tc{
  .tip{
    text-align: center;
    font-size: 0.45rem;
    background: #7190FF;
    color: #fff;
    border-radius: 0px;
    height: 49px;
    line-height: 49px;
    border: none;
  }
}
</style>
