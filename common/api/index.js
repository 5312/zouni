import tool from '../js/tool';
const request = tool.uniRequest.bind(tool);
export default {
	//洗车机状态查询
	chaPost(params){
		return new Promise(function(resolve,reject){
			request({
				url:'/api/Zhan/cha_post',
				method:'GET',
				params,
				isNoCode:true,
				success:function(result){
					if(result.code!=0){
						resolve(result);
					}else{
						reject(result);
					}
				},
			})
		})
	},
	//洗车机控制
	zhan(params){
		return new Promise(function(resolve,reject){
			request({
				url:'/api/Zhan',
				method:'GET',
				params,
				success:function(res){//故障拦截
					if(res.code == 0){
						uni.showModal({
						    title: '提示',
						    content: res.msg,
						    success: function (res) {
						        if (res.confirm) {
									reject(res);
						        } else if (res.cancel) {
									reject(res);
						        }
						    }
						});
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
				isNoCode:true,
				success:resolve,
			})
		})
	},
}