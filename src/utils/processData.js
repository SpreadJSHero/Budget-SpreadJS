import { dataType } from "element-plus/es/components/table-v2/src/common"

const getTwoArray = (m,n) => {
    /**
     * 生成m*n的二维数组
     */
     let dataArr = new Array(m)
     for(let i=0;i<dataArr.length;i++){
      dataArr[i] = new Array(n).fill(0)
      dataArr[i].forEach((item,index,arr) => {
         dataArr[i][index] = Math.ceil(Math.random()*(1000000-200000))
        })
     }
     console.log(dataArr)
     return dataArr
}
export {getTwoArray}