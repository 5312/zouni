import Vue from 'vue'
import App from './App'


//vuex-store
import store from '@/store/index.js'  
Vue.prototype.$store = store 

//缓存处理
import MinCache from './common/js/unit.js'
Vue.use(MinCache,{timeout: 0});//默认永久缓存

import tool from "@/common/js/tool.js"
Vue.prototype.$tool = tool

// uview
import uView from "uview-ui";
Vue.use(uView);

//api集中处理
import MinHttp from './common/api/http'
import api  from './common/api/api'
Vue.use(MinHttp)

Vue.config.productionTip = false;

App.mpType = 'app'

const app = new Vue({
	store,
	api,
	...App,
	
})
app.$mount()
