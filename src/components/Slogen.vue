<template>
    <div class="slogen-box">
        <img @click="jumpToRecord" class="slogen" alt="slogen" src="../assets/logo.png" :style="getImageStyle">
    </div>
</template>
<script>
import { mapMutations } from 'vuex';
let timer = null
let counter = 0
export default {
    name: 'Slogen',
    props: ['width'],
    methods: {
        ...mapMutations(['toggleShowDebug']),
        jumpToRecord () {
            // 十秒内点击十次
            if (counter === 0) {
                timer = setTimeout(() => {
                    counter = 0
                }, 10000);
            } else if (counter === 10) {
                clearTimeout(timer)
                counter = 0
                this.$router.push('/payRecord')
                this.toggleShowDebug()
            }
            counter += 1
        }
    },
    computed: {
        getImageStyle(){
            if(this.width){
                return {
                    width: this.width + "px"
                }
            }
        }
    }
}
</script>

<style scoped>
.slogen-box {
    position: relative;
}
.slogen {
}
</style>


