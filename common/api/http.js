//创建es6的Symbol私有属性，防止冲突
const config = Symbol('config');
const requestBefore = Symbol('requestBefore');
const requestAfter = Symbol('requestAfter');

class MinHttp {
	//默认配置
	[config] = { //symbol在作为属性时要用[]
		baseURL: '',
		header: {
			'content-type': 'application/json',
		},
		method: 'GET',
		dataType: 'json',
		withCredentials: true,
		responseType: 'text'
	}

	//拦截器
	interceptors = {
		request: (func) => {
			if (func) {
				MinHttp[requestBefore] = func;
			} else {
				MinHttp[requestBefore] = (request) => request
			}
		},
		response: func => {
			if (func) {
				MinHttp[requestAfter] = func
			} else {
				MinHttp[requestAfter] = (response) => response
			}
		}
	}
	//静态方法，用类本身调用
	static[requestBefore](config) {
		return config
	}

	static[requestAfter](response) {
		return response
	}

	// 设置配置
	setConfig(func) {
		this[config] = func(this[config])
	}

	//请求
	http(options = {}) { //[]调用symbol
		options.baseURL = options.baseURL || this[config].baseURL;
		options.dataType = options.dataType || this[config].dataType;
		options.url = options.baseURL + options.url;
		options.data = options.data;
		options.header = { ...options.header,
			...this[config].header
		};
		options.method = options.method || this[config].method;

		options = { ...options,
			...MinHttp[requestBefore](options)
		}; //请求拦截器
		return new Promise((resolve, reject) => {
			options.success = function(res) {
				resolve(MinHttp[requestAfter](res));
			}
			options.fail = function(err) {
				reject(MinHttp[requestAfter](err));
			}
			uni.request(options)
		})
	}
	//get请求
	get(url, data, options = {}) {
		options.url = url
		options.data = data
		options.method = 'GET'
		return this.http(options)
	}

	post(url, data, options = {}) {
		options.url = url
		options.data = data
		options.method = 'POST'
		return this.http(options)
	}

}
//vue插件
MinHttp.install = function(Vue) {
	Vue.mixin({
		beforeCreate: function() {
			if (this.$options.api) {
				//console.log(this.$options.api)
				Vue._minHttp = this.$options.api //new Vue注册的名字
			}
		}
	})
	Object.defineProperty(Vue.prototype, '$api', { //精准添加到prototype上,this.$minHttp
		get: function() {
			return Vue._minHttp.apis
		}
	})
}

export default MinHttp
