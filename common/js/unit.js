async getTokenValue(options) {
		let {
			success,
			fail,
			complete
		} = options
		var _this = this;
		try {
			const r = await uni.login({
				provider: "weixin"
			})
			const res = await uni.getUserInfo({
				provider: "weixin"
			})
			
			const res1 = await uni.request({
				url: baseUrl + "/api/user/login",
				method: "POST",
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: {
					wxapp_id: "10001",
					code: r[1].code,
					user_info: JSON.stringify(res[1].userInfo),
					signature: res[1].signature,
					encrypted_data: res[1].encryptedData,
					iv: res[1].iv
				},
			})
			console.log(res1)
			if (res1[1].statusCode === 200 && res1[1].data.code === 1) {
				_this.uniSetStorage('userInfo', res[1].userInfo)
				_this.uniSetStorage('token', res1[1].data.data.token)
				_this.uniSetStorage('userId', res1[1].data.data.user_id)
				success ? success() : false
			} else {
				
				_this.uniShowToast({
					title: "获取用户token失败",
					icon: "none"
				})
			}
			complete ? complete() : false
		} catch (e) {
			console.log(e)

			_this.uniShowToast({
				title: "获取用户token失败",
				icon: "none"
			})
			complete ? complete() : false
		}
	}
export default {
	
}