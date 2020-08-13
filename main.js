import Vue from 'vue'
import App from './App'

import tool from "@/common/js/tool.js"
Vue.prototype.$tool=tool

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
