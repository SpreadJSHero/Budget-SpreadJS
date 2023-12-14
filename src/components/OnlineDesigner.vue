
<template>
  <div id="designer-container"></div>
  <el-dialog v-model="distributeVisible" size="small" @open="initUser()" :show-close=false>
    <template #header>
      <h4>下发预算编制</h4>
    </template>
    <el-table :data="users" :width="700">
      <el-table-column prop="userName" label="部门" width="180" />
      <el-table-column label="状态" width="300">
        <template #default="scope"> {{ scope.row.status ? "已填报" : "未填报" }} </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" @click="openFillPage(scope.row)">编制链接</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
        <el-button type="primary" @click="hasBudgetComplete">编制完成</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref} from 'vue'
import { getPreivewConfig, checkAllFilled,loadTemplate} from "../utils/common"
import { useRouter } from "vue-router"
import { ElMessage } from 'element-plus';
import baseSetting from "../config/baseSetting"
const {budgetType} = baseSetting

  let designer,spread
  let distributeVisible = ref(false)   //下发任务面板显示控制
  let selectedBudget = ref(budgetType.sales)  //当前选中预算类型
  let taskId = ref()   //当前填报的任务
  let router = useRouter()
  let users = ref([])
  const initDesigner = () => {
    // 初始化designer
    designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
    designer.setConfig(getPreivewConfig(selectedBudget,distributeVisible,taskId,router))
    spread = designer.getWorkbook()
    loadTemplate(designer,selectedBudget.value,taskId)
  }

  const initUser = () => {
    // 打开下发模板时根据选中预算类型生成下发人员
    let sheetCount = spread.getSheetCount()
    for(let i=1;i<sheetCount;i++){
          users.value.push({
            budgetType:selectedBudget.value,
            userName:spread.getSheet(i).name(),
            status:false
          })
        }
    return users
  }

  const hasBudgetComplete = async() => {
    /**
     * 确认预算是否编制完成，如果完成,清除用户信息，隐藏编制弹框
     * 这里确认是否编制完成需要与localStrage中的信息做对比。
     * 各部门没有完成编制，无法关闭当前弹框做审核。
     */
    let allFilled = await checkAllFilled(selectedBudget.value,taskId.value)
    if(allFilled){
      users.value = [] 
      distributeVisible.value = false
      ElMessage.success("预算编制完成")
    }else{
      ElMessage.error("预算编制未完成，无法取消任务")
    }
    

  }

  const openFillPage = (rowData) => {
    // 跳转部门预算填报界面
    const url = router.resolve({
      path:'/fill',
      query:{
        budgetType: rowData.budgetType,
        id: taskId.value,
        user:rowData.userName
      }
    })
    window.open(url.href)
  }
  
  onMounted(() => {
    initDesigner()
  })
   
</script>

<style>
#designer-container {
  height: calc(100vh - 110px);
  margin:0;
  padding:0;
}


.distribute-icon {
  background: url("../assets/distribute.png");
  background-size: 35px 35px;
}

.checksummary-icon {
  background: url("../assets/summary.png");
  background-size: 35px 35px;
}

.save-template-icon {
  background: url("../assets/save.png");
  background-size: 35px 35px;
}

.clear-local-icon {
  background: url("../assets/clear.png");
  background-size: 35px 35px;
}


/* dirver.js
div#driver-page-overlay{
  transition: all 0.2;
}
div#driver-highlighted-element-stage {
  transition: all 0.2;
} */
</style>