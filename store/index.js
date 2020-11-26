import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/common/api/api.js'
Vue.use(Vuex);

const store = new Vuex.Store({
    state: {//全局数据，放这里 --通过 store.state 来获取状态对象
        site: null,//附近站点列表的数据
    },
    mutations: {//改变 store 中的状态的唯一途径就是显式地提交 (commit) mutation,只能是同步的
        setSite(state, payload) {//store.commit('setRssItem'，{rssItem:"1"}) payload载荷应该为对象
           state.site = payload.site
        }
    },
	actions: {//Action 通过 store.dispatch 方法触发：store.dispatch('increment')
		async setSite(context,payload) {

		   const result = await api.apis.index_GetNearbyGasStation({
		   	//附近站点
		   	lat: String(payload.latitude),
		   	lng: String(payload.longitude)
		   });
		   if(result.code == 0) return ;//请求失败
		   context.commit('setSite',{'site':result.data.posiList})
		}
	}
})
export default store