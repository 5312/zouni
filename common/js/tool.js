export const baseUrl = "https://xi.ydeshui.com/index.php?s="
let getTokenCount = 0
export default {
	htmlre(str) {
		var s = "";
		if (str.length == 0) return "";
		s = str.replace(/&amp;/g, "&");
		s = s.replace(/&lt;/g, "<");
		s = s.replace(/&gt;/g, ">");
		s = s.replace(/&nbsp;/g, " ");
		s = s.replace(/&#39;/g, "\'");
		s = s.replace(/&quot;/g, "\"");
		s = s.replace(/↵/g, "<br/>");
		return s;
	},
	formatRichText(html) {
		let newContent = html.replace(/<img[^>]*>/gi, function(match, capture) {
			match = match.replace(/style="[^"]+"/gi, '').replace(/style='[^']+'/gi, '');
			match = match.replace(/width="[^"]+"/gi, '').replace(/width='[^']+'/gi, '');
			match = match.replace(/height="[^"]+"/gi, '').replace(/height='[^']+'/gi, '');
			return match;
		});
		newContent = newContent.replace(/style="[^"]+"/gi, function(match, capture) {
			match = match.replace(/width:[^;]+;/gi, 'max-width:100%;').replace(/width:[^;]+;/gi, 'max-width:100%;');
			return match;
		});
		newContent = newContent.replace(/<br[^>]*\/>/gi, '');
		newContent = newContent.replace(/\<img/gi,
			'<img style="max-width:100%;height:auto;display:inline-block;margin:10rpx auto;"');
		return newContent;
	},
	nuiSetNavigationBarTitle(title) {
		uni.setNavigationBarTitle({
			title: title
		});
	},
	getUrlParams(url){
		if(url.startsWith('https://xi.ydeshui.com')){
			let params = url.split('?')[1];
			//用来储存对象
			let obj = {};
			//没参数返回
			if(!params) return;
			//将参数分割
			var arr = params.split('$');
			arr.forEach((x)=>{
				let array =  x.split('=');
				obj[array[0]] = array[1];
			})
			return obj;
		}
	},
	uniRequest(options) {
		let {
			url,
			method,
			params,
			headers,
			success,
			fail,
			isNoCode,
			complete,
			loading
		} = options
		let countNumber = 0;
		if(!loading){
			this.uniShowLoading({})
		}
		uni.request({
			url: baseUrl + url,
			method: method ? method : "GET",
			withCredentials: true,
			data: params ? Object.assign({
				wxapp_id: "10001",
				token: this.uniGetStorage("token")
			}, params) : {
				wxapp_id: "10001",
				token: this.uniGetStorage("token")
			},
			header: headers,
			success: (res) => {
				//console.log("res请求结果", res)
				if (res.statusCode === 200) {
					if (isNoCode) {
						success ? success(res.data) : false
					} else if (res.data.code == 1) {
						success ? success(res.data.data,res.data.msg) : false
					} else if (res.data.code == -1) {
						this.uniShowToast({
							title: "token失效，重新登陆！",
							icon: "none"
						})
						this.uniRemoveStorage("token")
						this.uniRemoveStorage("userInfo")
						this.uniRemoveStorage("userId")
						this.getTokenValue()
					}
				} else {
					this.uniShowToast({
						title: "请求失败，请重试",
						icon: "none"
					})
				}
			},
			fail: (err) => {
				this.uniShowToast({
					title: "请求失败，请重试",
					icon: "none"
				})
				fail ? fail() : false
			},
			complete: () => {
				this.uniHideLoading()
				complete ? complete() : false
			}
		})
	},
	getTokenValue(options) {
		let {
			success,
			fail,
			complete
		} = options;
		let referrerId  = this.uniGetStorage("referrerId");//推荐人id
		var _this = this;
		uni.login({ //获取微信用户的code值
			provider: 'weixin',
			success(r) {
				if (r.code) {
					uni.getUserInfo({ //获取微信用户的encryptedData，iv值
						provider: 'weixin',
						success(res) {
							uni.request({
								url: baseUrl + "/api/user/login",
								method: "POST",
								header: {
									'Content-Type': 'application/x-www-form-urlencoded'
								},
								data: {
									wxapp_id: "10001",
									code: r.code,
									user_info: JSON.stringify(res.userInfo),
									signature: res.signature,
									encrypted_data: res.encryptedData,
									iv: res.iv,
									referrerId:referrerId || ''
								},
								success: (res1) => {
									if (res1.statusCode === 200 && res1.data.code === 1) {
										_this.uniSetStorage('userInfo', res.userInfo)
										_this.uniSetStorage('token', res1.data.data.token)
										_this.uniSetStorage('userId', res1.data.data.user_id)
										success ? success() : false
									} else {
										_this.uniShowToast({
											title: "获取用户token失败",
											icon: "none"
										})
									}
									complete ? complete() : false
								},
								fail: (err) => {
									_this.uniShowToast({
										title: "获取用户token失败",
										icon: "none"
									})
									complete ? complete() : false
								}
							})
						},
						fail: (err) => {
							_this.uniShowToast({
								title: "获取用户信息失败",
								icon: "none"
							})
							complete ? complete() : false
						}
					});
				} else {
					_this.uniShowToast({
						title: "获取微信登录login的code失败！",
						icon: "none"
					})
					complete ? complete() : false
				}
			}
		});
	},
	async getMyAlipayToken(options) {
		let {
			service,
			success,
			fail,
			complete
		} = options
		var _this = this;
		const [error, provider] = await uni.getProvider({
			service: service
		}) //获取服务类型
		const [errMsg, loginCode] = await uni.login({
			provider: provider
		}) //获取登录code
		if (errMsg) {
			_this.uniShowToast({
				title: "获取微信登录login的code失败！",
				icon: "none"
			})
			complete ? complete() : false
		}
		if (loginCode.authCode) {
			const [e, login] = await uni.request({
				url: baseUrl + "/api/user/login",
				method: "POST",
				header: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: {
					authcode: loginCode.authCode,
				}
			});
			console.log(login)
			console.log(e)
		}

	},
	distanceHanlde(val) {
		if (val) {
			let value = parseFloat(val)
			return value < 1000 ? val + 'm' : (value / 1000).toFixed(2) + 'km'
		} else {
			return '0m'
		}
	},
	uniShowToast(options) {
		let {
			title,
			icon,
			mask,
			duration,
			image
		} = options
		uni.showToast({
			title: title,
			icon: icon ? icon : "success",
			image: image ? image : "",
			mask: mask ? mask : false,
			duration: duration ? duration : 1500,
			complete: () => {
				setTimeout(() => {
					uni.hideToast();
				}, 30000)
			}
		});
	},
	uniRedirectTo(options) {
		let {
			url,
			success,
			fail,
			complete
		} = options
		uni.redirectTo({
			url: url,
			success: success ? success() : false,
			fail: fail ? fail() : false,
			complete: complete ? complete() : false
		});
	},
	uniReLaunch(options) {
		let {
			url,
			success,
			fail,
			complete
		} = options
		uni.reLaunch({
			url: url,
			success: success ? success() : false,
			fail: fail ? fail() : false,
			complete: complete ? complete() : false
		});
	},
	uniNavigateTo(options) {
		let {
			url,
			animaType,
			time,
			success,
			fail,
			complete
		} = options
		uni.navigateTo({
			url: url,
			animationType: animaType,
			animationDuration: time ? time : 3000,
			success: success ? success() : false,
			fail: fail ? fail() : false,
			complete: complete ? complete() : false
		})
	},
	encodeOrDecode(obj, isEncode = true) {
		if (!obj) return
		let result = isEncode ? encodeURIComponent(JSON.stringify(obj)) : JSON.parse(decodeURIComponent(obj))
		return result
	},
	uniShowLoading(options) {
		let {
			title,
			mask,
			success,
			fail,
			complete
		} = options
		uni.showLoading({
			title: title ? title : '加载中',
			mask: mask ? mask : true,
			success: () => {
				success ? success() : false
			},
			fail: () => {
				fail ? fail() : false
			},
			complete: () => {
				complete ? complete() : false
			},
		})
	},
	uniHideLoading() {
		uni.hideLoading()
	},
	uniSetStorage(key, val) {
		try {
			uni.setStorageSync(key, val);
		} catch (e) {
			console.log(e);
		}
	},
	uniGetStorage(key) {
		try {
			return uni.getStorageSync(key);
		} catch (e) {
			return "fail";
		}
	},
	uniRemoveStorage(key) {
		try {
			uni.removeStorageSync(key);
		} catch (e) {
			console.log(e);
		}
	},
	isGetLocation(type = "scope.userLocation", success = null, fail = null) {
		let _this = this
		uni.getSetting({
			success(res) {
				if (!res.authSetting[type]) {
					_this.getAuthorizeInfo(type, success, fail)
				} else {
					if (type === 'scope.userInfo') {
						if (_this.uniGetStorage("token")) {
							success ? success() : false
						} else {
							_this.getTokenValue({
								success: () => {
									success ? success() : false
								}
							})
						}
					} else {
						success ? success() : false
					}
				}
			}
		});
	},
	getAuthorizeInfo(type, success, fail) {
		let _this = this
		// #ifdef MP-ALIPAY
		//支付宝authorize无法使用
		const scopes = {
			"scope.userLocation": async function() {
				let [error, result] = await uni.getLocation();
				if (result) {
					success ? success() : false
				} else {
					if (fail) {
						fail()
					} else {
						_this.uniShowToast({
							title: "你拒绝了授权!",
							icon: "none"
						})
						console.log("你拒绝了授权")
					}
				}
			},
			"scope.userInfo": async function() { //判断是否登录成功
				const [error, userInfo] = await uni.getUserInfo();
				console.log("登录判断", userInfo)
				if (!userInfo) {
					return
				};
				if (_this.uniGetStorage("token")) {
					success ? success() : false
				} else {
					_this.getMyAlipayToken({
						service: "oauth",
						success: () => {
							success ? success() : false
						}
					})
				}
			}
		}
		scopes[type]()
		// #endif

		// #ifndef MP-ALIPAY 
		//支付宝无法使用authorize
		uni.authorize({
			scope: type,
			success() {
				if (type === 'scope.userInfo') {
					if (_this.uniGetStorage("token")) {
						success ? success() : false
					} else {
						_this.getTokenValue({
							success: () => {
								success ? success() : false
							}
						})
					}
				} else {
					success ? success() : false
				}
			},
			fail() {
				if (fail) {
					fail()
				} else {
					_this.uniShowToast({
						title: "你拒绝了授权!",
						icon: "none"
					})
					console.log("你拒绝了授权")
				}
			}
		})
		// #endif
	},
	wxPayMoney(timeStamp, nonceStr, pack, signType, paySign, sucfun, failfun = null, compfun = null) { //封装微信支付函数
		uni.requestPayment({
			provider: 'wxpay',
			orderInfo: "orderInfo",
			timeStamp: timeStamp + '',
			nonceStr: nonceStr,
			package: `prepay_id=${pack}`,
			signType: signType,
			paySign: paySign,
			success(res) {
				sucfun(res)
			},
			fail(err) {
				failfun ? failfun(err) : false
			},
			complete(result) {
				compfun ? compfun(result) : false
			}
		});
	},
}
