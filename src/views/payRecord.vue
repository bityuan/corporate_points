<template>
<div class="record-page">
    <ul>
        <li v-for="(item,index) in record" :key="index">
            <span>{{item.t | formatTime}}</span>
            <span>{{item.a}}</span>
            <code>{{item.h}}</code>
            <van-button type="danger" class="del-btn" size="mini" @click="del(index)">删除</van-button>
        </li>
    </ul>
    <p v-if="record.length === 0">暂无本地记录</p>
</div>
</template>
<script>
import { PAY_RECORD } from '@/libs/storageList.js'
export default {
  data() {
      return {
          record: []
      }
  },
  mounted() {
      // 在平行链上查询执行情况
      let re = this.$storageList.data[PAY_RECORD] || []
    //   [
    //       { t: +new Date(), a: 'action', h: '15YsqAuXeEXVHgm6RVx4oJaAAnhtwqnu3H'}
    //   ]
      re.sort((a, b) => {return b.t - a.t})
      this.record = re
  },
  methods: {
      del (index) {
          this.record.splice(index, 1)
          this.$storageList.deleteOne(PAY_RECORD, index)
      }
  }
}
</script>
<style lang="css" scoped>
    .record-page p {
        padding-top: 50px;
        text-align: center;
    }
    .record-page ul{
        padding: 20px 20px 20px 30px;
    }
    .record-page li {
        list-style: decimal;
        position: relative;
    }
    .record-page li>span {
        display: inline-block;
        padding-right: 20px;;
    }
    .record-page li code {
        margin: 6px 0;
        padding: 2px 8px;
        display: block;
        color:crimson;
        background-color: pink;
        word-break: break-all;
        border-radius: 2px;
    }
    .record-page li .del-btn{
        position: absolute;
        top: 0;
        right: 0;
    }
</style>