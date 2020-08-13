const API_baseUrl = "https://xi.ydeshui.com/index.php?s=";
const requst = (url, data, method) => {
	let _url = API_baseUrl + url;
	return new promise((resolve, reject) => {
		wx.request({
			url: _url,
			method: method ? method : "get",
			data: data,
			header: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			success(request) {
				resolve(request)
			},
			fail:(error){
				reject(error)
			}
		})
	})
}

export default {
	uniLogin:(data) => {
		return request("/api/user/login",data);//登录接口
	},
	
}
