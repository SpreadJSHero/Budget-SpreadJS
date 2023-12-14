import localforage  from "localforage";
import {ElMessage} from 'element-plus'
import { SUCCESS,ERROR } from "../config/constantValue";

/**保存或更新单条记录 */
const saveRecord = async (template,user,json) => {
    let result = ERROR
    try{
        localforage.setItem(`${template}-${user}`,json)
        return result = SUCCESS
    }catch{
        return ERROR
    }
}

const getTemplateReocords = async(template) => {
    // 获取某一模板下的所有填报信息
    let result = []
    let dbKeys = await localforage.keys()
    for(let i=0; i<dbKeys.length;i++){
        let currentKey = dbKeys[i]
        let currentArray = currentKey.split("-")
        if(currentArray[0] == template){
            let value = await localforage.getItem(currentKey)
            result.push({
                user:currentArray[1],
                ...value
            })
        }
    }
    return result
}

const getRecord = async (template,user) => {
    let result = null
    result = await localforage.getItem(`${template}-${user}`)
    return result
}

const clearAll = async () => {
    await localforage.clear();
    ElMessage({
        message:'清理完毕！',
        type:'success'
       })
}


export {saveRecord,getRecord,getTemplateReocords, clearAll}


