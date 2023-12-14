<template>
   <el-row>
    <el-col :span="6">预算类型</el-col>
    <el-col :span="18">
      <el-radio-group v-model="selectedBudgetType" @change="changeBudgetType">
        <el-radio label="cost">成本预算</el-radio>
        <el-radio label="sales">销售预算</el-radio>
     </el-radio-group>
    </el-col>
  </el-row>
  <el-table :data="tableData" stripe style="width: 100%">
    <el-table-column prop="id" label="任务ID" width="180" />
    <el-table-column prop="bindData.name" label="项目名称" width="180" />
    <el-table-column v-if="selectedBudgetType==budgetType.cost" prop="bindData.customer" label="客户名称" width="180" />
    <el-table-column prop="step" label="预算流程" width="100">
      <template #default="scope">
        <el-tag 
          :type="scope.row.step == budgetStep.start ? 'info' : (scope.row.step == budgetStep.check ? 'warning' : 'success')"
          disable-transitions>
          {{ scope.row.step }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-button
          size="small"
          type="primary"
          v-if="scope.row.step==budgetStep.end"
          plain
          @click="showDetail(scope.row)"
          >打印预算表</el-button>
          <el-button v-if="scope.row.step==budgetStep.check" 
          size="small"
          type="warning"
          plain
           @click="handleCheck(scope.row)">
            预算审核
          </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-dialog
    v-model="dialogVisible"
    title="预算表详情"
    destory-on-close
    center
    opened="initSpread"
  >
   <div>
      <el-button color="#95106b" @click="printWorkbook">打印</el-button>
   </div>
    <div id="preview-ss">
    </div>
  </el-dialog>
</template>
  
<script setup>
import { TaskData } from '../models';
import baseSetting from '../config/baseSetting';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
let { budgetType,budgetStep } = baseSetting
import {ADMIN} from "../config/constantValue"
const router = useRouter()
// 控制预览模板是否展示
const dialogVisible = ref(false)
const tableData = ref([])
const selectedBudgetType = ref(budgetType.cost)
let spread = null
onMounted(async () => {
  // 默认查看成本预算数据
  tableData.value = await TaskData.getList(selectedBudgetType.value) 
})

const handleCheck = (rowInfo) => {
  // 跳转进行领导审核,跳转领导审核界面
  const url = router.resolve({
      path:'/fill',
      query:{
        user: ADMIN,
        id:rowInfo.id,
        budgetType:selectedBudgetType.value
      }
    })
  window.open(url.href)
}

const showDetail = (rowInfo) => {
  dialogVisible.value = true
  initSpread(rowInfo)
}

const initSpread = (rowInfo) => {
  setTimeout(()=>{
    if(!spread){
      spread = new GC.Spread.Sheets.Workbook(document.getElementById('preview-ss'))
    }
    let {fileJson} = rowInfo
    spread.fromJSON(JSON.parse(fileJson))
  },0)  
}

const printWorkbook = () => {
  let printInfo = new GC.Spread.Sheets.Print.PrintInfo()
  printInfo.fitPagesWide(1)
  printInfo.margin({top:10,bottom:10,left:10,right:10,header:10,footer:10})
  printInfo.paperSize(new GC.Spread.Sheets.Print.PaperSize(GC.Spread.Sheets.Print.PaperKind.a4))
  /**质量银子越高，打印越清晰，但耗时更多 */
  printInfo.qualityFactor(4)
  printInfo.showBorder(false)
  printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
  printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
  let count = spread.getSheetCount()
  for(let i=0;i<count;i++){
    let sheet = spread.getSheet(i)
    sheet.printInfo(printInfo)
  }
  spread.print()

}

const changeBudgetType = async (value) => {
  tableData.value = await TaskData.getList(value) 
  selectedBudgetType.value = value

}


</script>
<style>
 #preview-ss{
  height: 600px;
 }
 .el-row {
  margin-left: 0;
  padding: 20px 0;
  font-size: 14px;
  border-bottom: 1px solid #ccc;
  
}
.el-row:first-child{
  padding-left: 8px;
}

</style>