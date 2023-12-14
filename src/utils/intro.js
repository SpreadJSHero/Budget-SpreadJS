import Driver from "driver.js";
import "driver.js/dist/driver.min.css"

function Intro() {

}

function createOneSetpIntro(option, step, finishCallback){
    let op = option ?? {};
    op.onReset = finishCallback;
    const driver = new Driver(option);
    driver.defineSteps([step]);
    driver.start();
}

function createIntro(steps, currentStepIndex, designer){
    let option = {animate: true, opacity: 0.5, padding: 0};
    createOneSetpIntro(option, steps[currentStepIndex], function(){
        if(currentStepIndex + 1 < steps.length){
            let nextStep = steps[currentStepIndex + 1];
            if(nextStep.callBefore){
                nextStep.callBefore.call(this, designer);
            }
            setTimeout(function(){
                createIntro(steps, currentStepIndex + 1, designer);
            }, 610)
        }
    })
}

function createIntro1(steps, currentStepIndex, designer){
    let option = {animate: true, opacity: 0.5, padding: 0};
    option.onReset = function(){
        let currentStep = steps[currentStepIndex];
        if(currentStep.callAfter){
            currentStep.callAfter.call(this, designer);
        }
        if(currentStepIndex + 1 < steps.length){
            let nextStep = steps[++currentStepIndex];
            if(nextStep.callBefore){
                nextStep.callBefore.call(this, designer);
            }
            setTimeout(function(){
                driver.highlight(nextStep);
            }, 310)
        }
    };
    const driver = new Driver(option);
    driver.highlight(steps[currentStepIndex]);

}




Intro.designerIntro = function (designer) {

    let isGuide = localStorage.getItem('isGuideDesigner')
    if (isGuide) {
        return;
    }

    let steps = [
        {
            element: '.el-aside',
            popover: {
                className: 'first-step-popover-class',
                title: '场景选择',
                description: '欢迎来到SpreadJS填报示例，在这里可以体验SpreadJS在线填报模板设计、数据绑定等功能。您可以选择一个现有场景，或者使用自定义设计一个全新的填报场景。',
                position: 'right',
                closeBtnText: '下一步'
            }
        },
        {
            element: '.ribbon',
            popover: {
                className: 'first-step-popover-class',
                title: '模板设计',
                description: '使用SpreadJS在线表格编辑器设计修改填报模板.',
                position: 'bottom',
                closeBtnText: '下一步'
            }
        },
        {
            element: '.ribbon-button-template',
            popover: {
                title: '数据绑定',
                description: '点击数据-工作表绑定，拖拽字段列表，给单元格添加绑定字段。<br/>关于设计器数据绑定可以<a target="_blank" href="https://www.bilibili.com/video/BV1c84y1k7FQ/?spm_id_from=333.788&vd_source=9e1edbd683c15937dd39311528998d2c">观看视频</a>。',
                position: 'bottom',
                closeBtnText: '下一步'
            },
            callBefore: () => {
                document.querySelectorAll('[data-id="data"]')[0].click();
            }
        },
        {
            element: '.save-template-icon',
            popover: {
                title: '保存',
                description: '保存设计好的填报模板',
                position: 'bottom',
                closeBtnText: '下一步'
            },
            callBefore: () => {
                document.querySelectorAll('[data-id="fill-custom"]')[0].click();
            }
        },
        {
            element: '.distribute-icon',
            popover: {
                title: '下发填报任务',
                description: '点击下发任务，通过个人连接完成填报。<br/>示例中通过不同连接地址模拟个人填报。',
                position: 'right',
                closeBtnText: 'bottom',
                closeBtnText: '下一步'
            }
        },
        {
            element: '.checksummary-icon',
            popover: {
                title: '查看汇总数据',
                description: '点击跳转数据汇总页面查看所有填报数据。',
                position: 'right',
                closeBtnText: '下一步'
            }
        },
        {
            element: '.clear-local-icon',
            popover: {
                title: '清除本地数据',
                description: '示例中所有数据都存储在浏览器DB中，未发送至服务器，可以清理本地数据重新开始填报',
                position: 'right',
                closeBtnText: '开始体验'
            },
            callAfter: function(){
                localStorage.setItem('isGuideDesigner', true)
            }
        },
    ]

    createIntro1(steps, 0, designer)
}

Intro.customDesignIntro = function (designer) {

    let isGuide = localStorage.getItem('idCustomerDesignIntro')
    if (isGuide) {
        return;
    }

    let steps = [
        {
            element: '.ribbon',
            popover: {
                className: 'first-step-popover-class',
                title: '模板设计',
                description: '使用SpreadJS在线表格编辑器设计填报模板',
                position: 'bottom',
                closeBtnText: '下一步'
            }
        },
        {
            element: '[data-command="fileMenuButton"]',
            popover: {
                title: '导入模板',
                description: '您也可以导入现有Excel模板',
                position: 'bottom',
                closeBtnText: '下一步'
            }
        },
        {
            element: '.right-panels',
            popover: {
                title: '数据绑定',
                description: '根据填报需求添加填报字段，拖拽字段到单元格中设置绑定关系。<a target="_blank" href="https://www.bilibili.com/video/BV1c84y1k7FQ/?spm_id_from=333.788&vd_source=9e1edbd683c15937dd39311528998d2c">观看视频</a>',
                position: 'left',
                closeBtnText: '下一步'
            },
            callBefore: (designer) => {
                if(!designer.getData("FieldListVisible")){
                    GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.DesignMode).execute(designer)
                }
            }
        },
        {
            element: '.save-template-icon',
            popover: {
                title: '保存',
                description: '保存自定义模板后开始下发填报',
                position: 'bottom',
                closeBtnText: '开始体验'
            },
            callBefore: () => {
                document.querySelectorAll('[data-id="fill-custom"]')[0].click();
            },
            callAfter: () => {
                localStorage.setItem('idCustomerDesignIntro', true)
            }
        },
    ]

    createIntro1(steps, 0, designer)
}


export default Intro;