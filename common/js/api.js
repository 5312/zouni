const API_baseUrl = "https://xi.ydeshui.com/index.php?s=";
const base = {
	login: "/api/user/login", //登录
	edit: "/api/user/edit", //修改信息
	detail: "/api/user.index/detail",
	tel: "/api/Tel",
	getCounts: "/api/user.coupon/getcounts"
}
//请求封装
const requst = options => {
	let {
		url,
		method,
		params,
		headers,
		success,
		fail,
		isNoCode,
		complete
	} = options;
	let _url = API_baseUrl + url;
	return new promise((resolve, reject) => {
		this.uniShowLoading({})
		wx.request({
			url: _url,
			method: method ? method : "get",
			data: params ? Object.assign({
				wxapp_id: "10001",
				token: this.uniGetStorage("token")
			}, params) : {
				wxapp_id: "10001",
				token: this.uniGetStorage("token")
			},
			withCredentials: true,
			header: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			success(request) {
				console.log("res请求结果", res)
				if (res.statusCode === 200) {
					if (isNoCode) {
						resolve(request.data)
					} else if (res.data.code == 1) {
						resolve(res.data.data)
					} else if (res.data.code == -1) {
						reject(res)
						this.uniShowToast({
							title: "token失效，重新登陆！",
							icon: "none"
						})
						this.uniRemoveStorage("token")
						this.uniRemoveStorage("userInfo")
						this.uniRemoveStorage("userId")
					}
				} else {
					this.uniShowToast({
						title: "请求失败，请重试",
						icon: "none"
					})
					reject(res)
				}
			},
			fail: (error) {
				this.uniShowToast({
					title: "请求失败，请重试",
					icon: "none"
				})
				reject(error)
			},
			complete: () => {
				this.uniHideLoading()
				complete ? complete() : false
			}
		})
	})
}

export default {
	uniLogin: (data) => {
		return request(base.login, data); //登录
	},

}
