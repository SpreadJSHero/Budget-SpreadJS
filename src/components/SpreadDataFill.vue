<template>
    <el-row style="text-align:end;padding: 10px;border-bottom: 1px solid #ccc;">
        <el-col :span="6" :push="16">
            <el-button color="#95106b" v-if="budgetType == baseSetting.budgetType.sales && user == ADMIN"
                @click="fillActualData">导入年度实际销售数据</el-button>
            <el-button color="#95106b" @click="handleSubmitBudget">
                {{ user == ADMIN ? '审核完毕' : '提交预算' }}
            </el-button>
        </el-col>
    </el-row>
    <el-dialog v-model="dialogVisible" title="签名" width="800px">
        <vue-esign ref="esign" :height="300" :is-crop="true" :lineWidth="16" v-model:bgColor="bgColor"
            :isClearBgColor="false" />
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleReset">清空画布</el-button>
                <el-button type="primary" @click="handleGenerate">
                    确认签名
                </el-button>
            </span>
        </template>
    </el-dialog>
    <div id="ss"></div>
</template>

<script setup>
import { onMounted } from "vue"
import { useRoute } from "vue-router"
import vueEsign from 'vue-esign'
import { addSignMenu, budgetFill, submitBudget, addHandWrite } from "../utils/common"
import { ElButton, ElMessage } from "element-plus";
import baseSetting from "../config/baseSetting"
import { ADMIN } from "../config/constantValue";
import { getTwoArray } from "../utils/processData"

const suffix = '实际数据'
let spread = null
let bgColor = ref("#F8F9F9")
let dialogVisible = ref(false)
let esign = ref(null)
let mobileHref = ref('')
const route = useRoute()
const { budgetType, id, user } = route.query
const initSpread = () => {
    spread = new GC.Spread.Sheets.Workbook("ss")
    addSignMenu(spread, `${user}经理`)
    addHandWrite(spread, dialogVisible)
}
const handleSubmitBudget = () => {
    ElMessageBox.confirm(
        '确认提交？',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            submitBudget(spread, budgetType, id, user)
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '取消提交',
            })
        })

}
const handleReset = () => {
    //清空签名
    esign.value.reset();
}

const handleGenerate = () => {
    // 签名后的图片固定在单元格当中
    esign.value.generate().then((res) => {
        let sheet = spread.getActiveSheet()
        let row = sheet.getActiveRowIndex()
        let col = sheet.getActiveColumnIndex()
        let spanInfo = sheet.getSpan(row,col)
        let picture = sheet.shapes.addPictureShape("pic", res, 0, 0, 100, 100);
        picture.startRow(row)
        picture.endRow(spanInfo ? row+spanInfo.rowCount : row+1)
        picture.startColumn(col)
        picture.endColumn(spanInfo ? col+spanInfo.colCount : col + 1)
        picture.startRowOffset(0);
        picture.startColumnOffset(0);
        picture.endRowOffset(0);
        picture.endColumnOffset(0);
        picture.allowResize(false)
        picture.allowMove(false)
        picture.allowRotate(false)
        handleReset()
        dialogVisible.value = false
    })
        .catch((err) => {
            // 画布没有签字时会执行这里提示一下
            ElMessage.error("签名失败")
        })
}

const fillActualData = () => {
    /**只有销售预算在admin状态下会调用该函数
     * 目的用于对预算表中的名称管理区区域数据进行填充
     */
    spread.suspendPaint()
    spread.suspendCalcService()
    let sheetCount = spread.getSheetCount()
    for (let i = 1; i < sheetCount; i++) {
        let sheet = spread.getSheet(i)
        let sheetName = sheet.name()
        let cusName = `${sheetName}${suffix}`
        let cusNameEntity = sheet.getCustomName(cusName)
        if (cusNameEntity) {
            let nameExp = cusNameEntity.getExpression()
            let { row, column, endRow, endColumn } = nameExp
            let arrayCol = endColumn - column + 1
            let arrayRow = endRow - row
            let actualData = getTwoArray(arrayRow, arrayCol)
            sheet.setArray(row + 1, column, actualData)
        }
    }
    spread.resumeCalcService()
    spread.resumePaint()
    
}


onMounted(() => {
    initSpread()
    // 初始化完成表格之后根据query中的参数加载对应的表
    budgetFill(spread, budgetType, id, user)
})

</script>

<style lang="css">
#ss {
    height: 90%;
}

button.el-button {
    padding: 8px 12px;
}

button.el-button:hover {
    color: #fff;
}
</style>