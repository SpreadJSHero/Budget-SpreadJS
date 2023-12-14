
import localForage from "localforage";
function TaskData(){

}

const _modelPrefix = "task_"
TaskData.getList = async function(budgetType){
    try{
        let key = _modelPrefix + budgetType;
        let recordList = await localForage.getItem(key);
        return recordList
    }
    catch{
        return null
    }
}

TaskData.getRecord = async function(selectBudgetType,id){
    // 查找某一条预算记录
    let recordList = await TaskData.getList(selectBudgetType)
    if(recordList){
        for(let record of recordList) {
            if(record.id == id){
                return record
            }
        }
    }
    return null
}

TaskData.addRecord = async function(taskType,taskInfo){
    try{
        let tempKey = _modelPrefix + taskType;
        let recordList = await localForage.getItem(tempKey) || [];
        recordList.push(taskInfo)
        localForage.setItem(tempKey, recordList);
        return taskInfo
    }
    catch{
        return null
    }
}


TaskData.updateRecord = async function(taskType,taskInfo){
    try{
        let tempKey = _modelPrefix + taskType
        let recordList = await localForage.getItem(tempKey) || []
        for(let index in recordList){
            let record = recordList[index]
            if(record.id == taskInfo.id){
                //替换原来数组
               recordList.splice(index,1,Object.assign(record,taskInfo)
               ) 
            }
        }
        localForage.setItem(tempKey, recordList);
        return true
    }
    catch{
        return false
    }
}




export { TaskData }