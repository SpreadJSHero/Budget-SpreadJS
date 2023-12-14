<template>
    <el-dialog v-model='hasShow' :title="title" width="300px" center>
        <span>{{detail}}</span>
        <template #footer>
            <span class="dialog-footer">
                <el-button v-if="showCancel" @click="cancelEvent">取消</el-button>
                <el-button type="primary" @click="confirmEvent">
                    确认
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script>
import { defineComponent, reactive, toRefs } from 'vue'

export default defineComponent({
    props:{
        title: String,
        detail: String,
        hasShow: Boolean,
        showCancel: true,
        confirmEvent:{
            type: Function
        },
        cancelEvent:{
            type:Function
        }

    },
    setup(props) {
        
        const {title,detail,hasShow,confirmEvent,cancelEvent} = toRefs(props)
        return {
           title,detail,hasShow,confirmEvent,cancelEvent
        }
    }
})
</script>

<style></style>