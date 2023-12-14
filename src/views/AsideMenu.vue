<template>
    <el-aside>
        <el-menu 
            active-text-color="#ffd04b" 
            background-color="#95106b" 
            class="el-menu-vertical-demo"
            :collapse='!isCollapse' 
            text-color="#fff" 
            :default-active="$route.path"
            router=true  

        >
            <div class="collapse-area">
                <ArrowLeftBold color="white" class="switch-icon" v-if="isCollapse" @click="isCollapse = false"></ArrowLeftBold>
                <ArrowRightBold color="white" class="switch-icon" v-else @click="isCollapse = true"></ArrowRightBold>
            </div>

            <el-menu-item v-for="item in businessType" :index="item.path" >
                <el-icon>
                    <component :is="item.icon"></component>
                </el-icon>
                <span>{{item.label}}</span>
            </el-menu-item>
            <div class="github-box">
                <a href="https://github.com/SpreadJSHeor/budget-spreadjs" target="_blank">
                    <img width="40" src="../assets/github.png" />
                </a>
            </div>
        </el-menu>
    </el-aside>
</template>

<script>
import { defineComponent, reactive, toRefs } from "vue"
import baseSetting from "../config/baseSetting"
import {useRouter} from "vue-router"
import {
    Promotion,Menu,Odometer, Files, DataBoard, ArrowRightBold, ArrowLeftBold
} from "@element-plus/icons-vue"
export default defineComponent({
    components: {
        Promotion,Menu,Odometer,Files, DataBoard, ArrowRightBold, ArrowLeftBold
    },

    setup() {
        const businessType = baseSetting.businessType
        const pageData = reactive({
            initialChoose: businessType[0].value,
            isCollapse: true,
            businessType,
        })
   
        return ({
            ...toRefs(pageData),
        })
    }
})
</script>

<style>
.collapse-area{
    height: 40px;
    line-height: 40px;
}
.github-box {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
}
.switch-icon {
    width: 20px;
    margin-left: 20px;
    padding-top: 10px;
    display: block;
    cursor: pointer;
}
.el-menu-vertical-demo {
  height: 100%;
}
</style>