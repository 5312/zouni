import MinHttp from './http.js'
import MinCache from '../js/unit.js'
import tool from '../js/tool.js'

const minHttp = new MinHttp()
const minCache = new MinCache({
	timeout: 0
});
let time = null;
const loading = { //加载动画
	star: () => {
		tool.uniShowLoading({}) //加载动画
		time = setTimeout(() => { //10s请求时长
			tool.uniShowToast({
				title: '请求超时，请重试',
				icon: "none"
			})
			tool.uniHideLoading()
		}, 60000); //超时关闭
	},
	end: () => {
		tool.uniHideLoading(); //先结束动画
		clearTimeout(time); //清除定时器
	}
}
//请求拦截器
minHttp.interceptors.request(request => {
	if (request.data == undefined) request.data = {};
	//增加token
	request.data.wxapp_id = "10001"
	request.data.token = minCache.get("_token");
	//加载动画
	if (request.load) loading.star();
	return request;
});
//响应拦截器
minHttp.interceptors.response((response) => {
	loading.end(); //清除加载动画
	if (response.errMsg == "request:fail ") { //请求失败，进fail
		tool.uniShowToast({
			title: "请求失败，请重试",
			icon: "none"
		});
		return response;
	}
	if (response.statusCode !== 200) {
		tool.uniShowToast({
			title: "请求失败，请重试",
			icon: "none"
		})
		return response;
	} //
	if (response.data.code == -1) { //-1是token失效
		tool.uniShowToast({
			title: "token失效，重新登陆！",
			icon: "none"
		})
		minCache.clear();
		tool.getTokenValue();
	} else { //其他情况下
		return response.data;
	}
})
minHttp.setConfig(config => { //配置
	config.baseURL = 'https://xi.ydeshui.com/index.php?s='
	return config
})
let load = { load : true }
export default {
	// 这里统一管理api请求
	apis: {
		capture(data) { ////抓拍图片
			return minHttp.get('/api/Camera/capture', data,load)
		},
		categoryLists(data = {}) { //城市列表
			return minHttp.get('/api/category/lists', data)
		},
		addCar(url, data) { //车牌信息
			return minHttp.post(url, data);
		},
		index_Tel(data) { //联系电话
			return minHttp.get(`/api/Tel`, data)
		},
		index_goodsDetail(data) { //加油站详细页
			return minHttp.get(`/api/goods/detail`, data, load)
		},
		index_getConts(data) { //所有站点数量
			return minHttp.get(`/api/index/getconts`, data,load)
		},
		index_GetNearbyGasStation(data) { //附近站点列表
			return minHttp.get(`/api/index/page`, data)
		},
		index_siteGoodsList(data) { //全部站点列表
			return minHttp.get(`/api/goods/lists`, data, load)
		},
		index_ad(data) { //广告
			return minHttp.get(`/api/Ad`, data)
		},
		index_weather(data) { //天气
			return minHttp.get(`/api/weather`, data)
		},
		index_mapCover(data) { //地图
			return minHttp.get(`/api/index/`, data)
		},
		index_siteDetail(data){
			return minHttp.get(`/api/goods/detail`,data,load)
		},
		myAgreement(data){
			return minHttp.get(`/api/wxapp/help`,data,load)
		},
		myInfo_getPhone(data) { //获取手机号
			return minHttp.get(`/api/user/getPhoneNumber`, data)
		},
		scan_indexChaPost(data) { //洗车机状态查询
			return minHttp.get(`/api/Zhan/cha_post`, data, load)
		},
		buyNow(data, type) { //支付
			return minHttp.http({
				url: `/api/order/buyNow`,
				data,
				method: type,
				load,
			})
		},
		scan_indexZhan(data) { ////洗车机控制
			return minHttp.get(`/api/Zhan`, data,load)
		}
	}
}
