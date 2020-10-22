import tool from '../js/tool';
const request = tool.uniRequest.bind(tool);
export default {
	//洗车机控制
	zhan(params){
		return new Promise(function(resolve,reject){
			request({
				url:'/api/Zhan',
				method:'GET',
				params,
				success:function(res){//故障拦截
					if(res.code == 0){
						_this.$tool.uniShowToast({
							title: "机器故障，请联系客服！"
						})
						return
					}
					resolve(res);
				}
			})
		})
	},
	//联系电话
	telPhone(){
		return new Promise(function(resolve,reject){
				request({
					url:'/api/Tel',
					method:'GET',
					success:resolve
				})
		})
	},
	//获取广告地址
	getAdAddress(params){
		return new Promise(function(resolve,reject){
				request({
					url:'/api/Ad',
					method:'GET',
					success:resolve
				})
		})
	},
	//天气预报
	getWeatherForecast(params){
		return new Promise(function(resolve,reject){
			request({
				url: `/api/weather`,
				isNoCode: true,
				success:resolve,
			})
		})
	},
    //获取最近加油站
	GetNearbyGasStation(params){
		return new Promise(function(resolve,reject){
			request({
				url:'/api/index/page',
				method:'GET',
				params,
				loading:false,
				success:resolve
			})
		})
	},
	//地图打点
	mapGetCorver(params){
		return new Promise(function(resolve,reject){
			request({
				url:`/api/index/`,
				method:'GET',
				params,
				success:resolve,
			})
		})
	},
	//支付
	buyNow(params){
		return new Promise(function(resolve,reject){
			request({
				url: `/api/order/buyNow`,
				method: "POST",
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				params: params,
				success:function(res,msg){
					resolve([res,msg]);//promise无法传递两个参数，所以用数组
				},
			})
		})
	}
}