<template>
    <el-config-provider :size="size" :z-index="zIndex" :locale="locale">
      <common-header></common-header>
      <div class="common-layout">
        <el-container>
          <aside-menu  v-if="router.currentRoute.value.path&&router.currentRoute.value.path!='/fill'"/>
          <el-container>
            <el-main class="main">
              <router-view />
            </el-main>
          </el-container>
        </el-container>
      </div>
    </el-config-provider>
  </template>
  
  <script>
  import { defineComponent, reactive, toRefs,defineAsyncComponent } from 'vue'
  import { ElConfigProvider } from 'element-plus'
  import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
  import CommonHeader from '../views/CommonHeader.vue'
  import LoadingView from "../views/LoadingView.vue"
  const AsideMenu = defineAsyncComponent(() => import("../views/AsideMenu.vue"))
  const OnlineDesigner = () => import("../components/OnlineDesigner.vue")
  import { useRouter } from 'vue-router';
  
  export default defineComponent({
    components: {
      ElConfigProvider,
      OnlineDesigner,
      CommonHeader,
      LoadingView,
      AsideMenu
    },
    setup() {
      const reactiveData = reactive({
        // 维护响应式变化数据
        isCollapse: false
      })
      let router = useRouter()
  
      return {
        zIndex: 3000,
        size: 'small',
        locale: zhCn,
        ...toRefs(reactiveData),
        router
      }
    },
 
  
  })
  </script>
  
  <style>
  .el-header {
    padding: 0 10px;
    background-color: #95106b;
  }
  
  .el-aside {
    width: auto;
  }
  
  .el-dropdown {
    color: #fff;
    line-height: 60px
  }
  
  .example-showcase .el-dropdown-link {
    cursor: pointer;
    color: #fff;
    display: flex;
    align-items: center;
  }
  
  .el-select .el-input {
    margin-top: 16px;
  }
  
  .el-switch{
    margin-top: 16px;
    margin-left: 20px;
  }
  
  .el-menu-demo,
  .el-header-demo{
    height: 40px;
  }
  .main {
    overflow-x: hidden;
  }
  </style>
  