import { BusinessType, TaskData } from "../models"
import { ElMessage,ElMessageBox } from "element-plus"
import { clearAll } from './dbManager'
import baseSetting from "../config/baseSetting"
import 'element-plus/theme-chalk/el-message.css';
import 'element-plus/theme-chalk/el-message-box.css';
import { ADMIN } from "../config/constantValue";

const {budgetType,budgetStep} = baseSetting

/**
 * 预算下发阶段,和designer相关的阶段
 */
const getPreivewConfig = (selectedBudget, distributeVisible,taskId) => {
    // 自定制designer
    let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
    config.ribbon.push(
        {
        id: "fill-custom",
        text: "预算操作（定制按钮）",
        active: true,
        buttonGroups: [
        {
            label:"预算类型",
            commandGroup: {
                children: ["selectBudgetType"]
            }
        },    
        {
            label: "预算编制",
            thumbnailClass: "ribbon-thumbnail-editing",
            commandGroup: {
                children: [ "distributeTask"]
            }
        },
        {
            label: "数据",
            commandGroup: {
                children: ["clearLocalData"]
            }
        }]
    })
    config.commandMap = {
        selectBudgetType:{
            text: "选择预算类型",
            comboWidth: 120,
            type:"comboBox",
            commandName: "selectBudgetType",
            dropdownList:[
                {
                    text:"成本预算",
                    value: budgetType.cost
                },{
                    text:"销售预算",
                    value:budgetType.sales
                },
            ],
            execute:(context,propertyName) => {
            //    if(propertyName && propertyName!=selectedBudget.value){
                if(propertyName){
                    selectedBudget.value = propertyName
                    loadTemplate(context,propertyName,taskId)
                 }  
            },
            getState:(context)=>{
                return selectedBudget.value
            },
        },
        distributeTask: {
            title: "下发预算任务",
            text: "预算编制",
            iconClass: "distribute-icon",
            bigButton: true,
            commandName: "distributeTask",
            execute: function (context) {
                confirmDistribute(context,selectedBudget,distributeVisible)
            }
        },
        clearLocalData: {
            title: "清除本地缓存",
            text: "清除本地缓存",
            iconClass: "clear-local-icon",
            bigButton: true,
            commandName: "clearLocalData",
            execute: function () {
                localStorage.clear()
                clearAll();
            }
        },
    }
    return config
}

// 加载文件
const loadTemplate = async (designer,fileName,taskId) => {
    let templateStr = await BusinessType.getTemplate(fileName)
    let template = JSON.parse(templateStr)
    let spread = designer.getWorkbook()
    spread.suspendPaint()
    spread.fromJSON(template)
    bindInitialData(spread,fileName,taskId)
    spread.resumePaint()
    if (designer && template.designerBindingPathSchema) {
        designer.setData("treeNodeFromJson", JSON.stringify(template.designerBindingPathSchema))
        designer.setData("oldTreeNodeFromJson", JSON.stringify(template.designerBindingPathSchema))
        designer.setData("updatedTreeNode", JSON.stringify(template.designerBindingPathSchema));
        designer.refresh();
    } 
}

//数字转换，不足两位补0
const formatNumber = (num) => {
    num = num.toString()
    return num[1] ? num : '0'+ num
  }

const getNowTime = () => {
    let today = new Date()
    let date = today.getFullYear() + formatNumber((today.getMonth()+1)) + formatNumber(today.getDate())
    let time = formatNumber(today.getHours()) + today.getMinutes() + formatNumber(today.getSeconds())
    return date+"-"+time
  }
  
  
  
  
  //不同预算类型默认的初始数据
  const defaultBudgetData = {
    [budgetType.cost]: {
      id:`成本NV-${getNowTime()}`,//项目编号
      name:'',    //项目名称
      city: '',   //项目所在地
      customer: '',    //客户名称
      price: 0        //本次报价
  },
    [budgetType.sales]:{
      id: `销售NV-${getNowTime()}`,
      name:''
    }
  }
  

const bindInitialData = (spread,type,taskId) => {
    // 绑定初始数据
    let data = defaultBudgetData[type]
    let source = new GC.Spread.Sheets.Bindings.CellBindingSource(data)
    spread.suspendPaint()
    let sheetCount = spread.getSheetCount()
    for(let i=0; i<sheetCount;i++){
        let sheet = spread.getSheet(i)
        sheet.setDataSource(source)
    }
    spread.resumePaint()
    taskId.value = data.id
}

const confirmDistribute = (context,selectBudgetType,distributeVisible) => {
    /**预算任务下发时必填信息校验 */
    let sheet = context.getWorkbook().getSheet(0)
    let source = sheet.getDataSource().getSource()
    for(let key in source){
        if(!source[key]){
            ElMessage.error("红色区域必填项信息缺失")
            return
        }
    }
    // 确认是否下发编制任务
    ElMessageBox.confirm("确认下发预算编制任务吗？","下发确认",{
        confirmButtonText:'确认',
        cancelButtonText:"取消",
        type:'warning'
    }).then(() => {
        // 确认下发,存储当前预算模板，下发部门信息
        saveBudgetRecord(context, selectBudgetType)
        distributeBudgetTask(context,distributeVisible)
    }).catch(() => {
        ElMessage({
            type:'error',
            message:'取消发布'
        })
    })
}

const saveBudgetRecord = async(context,selectBudgetType) => {
    /**
     * 确认下发预算后，将任务信息存储到localStorage
     */
    let spread = context.getWorkbook()
    let bindData = spread.getSheet(0).getDataSource().getSource()
    await TaskData.addRecord(selectBudgetType.value,{
        id:bindData.id,
        bindData,
        step:budgetStep.start,
        fileJson: JSON.stringify(spread.toJSON({includeBindingSource:true})),
        status: Array.from(new Array(spread.getSheetCount()-1).fill(0),(x,index) => {
            return {
                department: spread.getSheet(index+1).name(),
                hasFill: false
            }
        })
    })
}

const checkAllFilled = async(selectedBudget,taskId) => {
    // 检测是否所有部门均已填报
    let record = await TaskData.getRecord(selectedBudget,taskId)
    if(record){
        let {status} = record
        let len = status.length
        for(let i=0;i<len;i++){
            if(status[i].hasFill == false){
                return false
            }
        }
        record.step = budgetStep.check
        await TaskData.updateRecord(selectedBudget,record)
        return true
    }
   
    return true
}

const distributeBudgetTask = (context,distributeVisible) => {
 /**
 * 点击预算编制按钮，根据不同的预算类型下发填报部门
 */
    distributeVisible.value = true
}

/***
 * 预算编制-提交阶段，和spreadjs相关的部分
 */

const budgetFill = async (spread,selectBudgetType,id,user) => {
    // 部门预算编制填写阶段
    let budgetRecord = await TaskData.getRecord(selectBudgetType,id)
    if(budgetRecord){
        let {fileJson} = budgetRecord
        spread.fromJSON(JSON.parse(fileJson))
        spread.options.scrollbarMaxAlign = true
        // 成本预算第一页为当前成本总预算,默认需要显示，后边sheet根据当前用户判定显示哪个部门
        if(user != ADMIN){
            let sheetCount = spread.getSheetCount()
            spread.getSheet(0).options.isProtected = true
            for(let i=1; i<sheetCount;i++){
                let sheet = spread.getSheet(i)
                if(sheet.name()!=user){
                    sheet.visible(false)
                }else{
                    sheet.options.isProtected = true
                    sheet.options.protectionOptions = {
                        allowResizeRows: true, 
                        allowResizeColumns: true,
                    }
                    spread.setActiveSheetIndex(i)
                }
            }
        }else{
            /**如果是Admin权限，则不启用表单保护，Admin可以调整表单内容 */
            let count = spread.getSheetCount()
            for(let i=0;i<count;i++){
                spread.getSheet(i).options.isProtected = false
            }
            spread.setActiveSheetIndex(0)
        }
        
    }else{
        ElMessage.warning("不存在该预算任务")
    }
}

const addSignMenu = (spread,user) => {
    // 注册签名的右键菜单
    let commandManager = spread.commandManager()
    let signMenu = {
        text:"添加签名",
        name:"signName",
        command:"signMenuCommand",
        workArea: "viewport"
    }
    spread.contextMenu.menuData.push(signMenu)
    let signMenuCommand = {
        canUndo: true,
        execute: function(context,options,isUndo){
            if(isUndo){
                GC.Spread.Sheets.Commands.undoTransaction(context,options)
                return true
            }else{
                GC.Spread.Sheets.Commands.startTransaction(context,options)
                let {activeRow,activeCol,sheetName} = options
                let sheet = context.getSheetFromName(sheetName)
                sheet.getCell(activeRow,activeCol).value(user).backColor('#F7A711').font('bold normal 15px normal')
                GC.Spread.Sheets.Commands.endTransaction(context,options)
                return true
            }
        }
    }
    commandManager.register("signMenuCommand",signMenuCommand,null, false, false, false, false)
}
const addHandWrite = (spread,showWriteDialog) => {
    // 注册签名的右键菜单
    let commandManager = spread.commandManager()
    let signMenu = {
        text:"添加手写签名",
        name:"handWriteName",
        command:"handWriteCommand",
        workArea: "viewport"
    }
    spread.contextMenu.menuData.push(signMenu)
    let handWriteCommand = {
        canUndo: false,
        execute: function(context,options,isUndo){
            showWriteDialog.value = true
        }
    }
    commandManager.register("handWriteCommand",handWriteCommand,null, false, false, false, false)
}

const submitBudget = async (spread,selectBudgetType,id,user) => {
    // 提交预算信息,更新对应的文件信息
    let updateStatus = false
    let tempSpread = new GC.Spread.Sheets.Workbook()
    let budgetRecord = await TaskData.getRecord(selectBudgetType,id)
    if(budgetRecord){
        let {fileJson,status} = budgetRecord
        tempSpread.fromJSON(JSON.parse(fileJson))
        if(user!=ADMIN){
            let sheetJson = spread.getSheetFromName(user).toJSON()
            tempSpread.getSheetFromName(user).fromJSON(sheetJson)
            for(let index in status){
                let sta = status[index]
                if(sta.department == user){
                    sta.hasFill = true
                    status[index] = sta
                }       
            } 
            budgetRecord.fileJson = JSON.stringify(tempSpread.toJSON())  
            budgetRecord.status = status
        }else{
            // 管理员审批，代表领导审批完成，整个预算阶段完成。
            budgetRecord.fileJson = JSON.stringify(spread.toJSON())
            budgetRecord.step = budgetStep.end
        }
        
        updateStatus = await TaskData.updateRecord(selectBudgetType,budgetRecord)
        if(updateStatus){
            ElMessage.success("提交成功")
        }else{
            ElMessage.error("提交失败")
        }
    }else{
        ElMessage.error("不存在当前预算任务")
    }
}






export {
    getPreivewConfig,
    loadTemplate,
    addSignMenu,
    addHandWrite,
    budgetFill,
    submitBudget,
    checkAllFilled
}