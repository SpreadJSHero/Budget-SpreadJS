//业务流程
const businessType = [
  {
    path: '/release',
    label: "预算编制",
    icon: 'Promotion'
  }, {
    path: '/task',
    label: "预算审核",
    icon: 'Menu'
  }
]

//预算流程进度
const budgetStep = {
  start: '编制开始',
  check: "编制审核",
  end:"审核完成"
}


//预算类型
const budgetType = {
  cost: 'cost' ,   //成本预算
  sales: 'sales'   //销售预算
}



export default  {
  businessType,
  budgetType,
  budgetStep
}