import localForage from "localforage";
import baseSetting from "../config/baseSetting"
import HttpUtils from '../utils/httpUtils'



function BusinessType(){

}

BusinessType.getList =  function(){
    return baseSetting.businessType;
}



const _modelPrefix = "temp_"

BusinessType.getTemplate = async function(value){
    try{
        let templateKey = _modelPrefix + value;
        let localTemplate = await localForage.getItem(templateKey);
        if(localTemplate) {
            return localTemplate
        }
        let defaultTemplate = await HttpUtils.get("./templates/" + value + ".json" , {responseType: "json"});
        // change blob type for open
        // defaultTemplate = defaultTemplate.slice(0, defaultTemplate.size, "application/zip");
        defaultTemplate = JSON.stringify(defaultTemplate);
        // save Template to local
        localForage.setItem(templateKey, defaultTemplate);
        return defaultTemplate
    }
    catch (e){
        console.error(e)
        return null
    }
}



export { BusinessType }