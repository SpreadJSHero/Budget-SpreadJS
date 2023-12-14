import {
    createRouter,
    createWebHashHistory
} from "vue-router";

const routes = [
    {
        path: '/release',
        component: () => import("../components/OnlineDesigner.vue"),
    }, {
        path: '/fill',
        component: () => import("../components/SpreadDataFill.vue")
    }, {
        path: '/task',
        component: () => import("../components/budgetTask.vue")
    }, {
        path: "/",
        redirect: '/release',
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
export default router