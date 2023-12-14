import axios from "axios"
// import { Loading, Notification } from 'element-ui';

const instance = axios.create({
    // baseURL: "http://localhost:8080",
    timeout: 100000,
    headers: {'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            }
});

let HttpUtils = function(){

}
HttpUtils.get = function(url, config){
    return new Promise((resolve, reject)=>{
        // let loadingInstance = Loading.service({ fullscreen: true, background: 'transparent' });
        instance.get(url, config)
        .then(response=>{ 
            resolve(response.data);
        })
        .catch((err)=>{
            // Notification({title: '错误',message: err,type:'error'});
            resolve(undefined);
        })
        // .finally(()=>{ loadingInstance.close();  });
    });
}

HttpUtils.post = function(url, params, config) {
    return new Promise((resolve, reject)=>{
        // let loadingInstance = Loading.service({ fullscreen: true, background: 'transparent' });
        instance.post(url, params, config)
        .then(response=>{ 
            resolve(response.data);
        })
        .catch((err)=>{
            // Notification({title: '错误',message: err,type:'error'});
            resolve(undefined);
        })
        .finally(()=>{ 
            // loadingInstance.close(); 
        });
    });
}


export default HttpUtils;