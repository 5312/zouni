<template>
	<view :class="['index fixed p-tblr',!isAuthAddress && isShowAuthLogin?'bg-page':'']">
		<template v-if="isAuthAddress">
			<view class="header absolute flex j-between a-center flex-row bg-white">
				<view class="left" @click="toPage('address')">
					<template v-if="addressInfo">
						<text class="address">{{addressInfo.name?addressInfo.name:''}}</text>
						<image src="../../static/image/more1.png" mode="" class="more_icon"></image>
					</template>
				</view>
				<view class="right">
					<template v-if="weatherInfo">
						<text>{{weatherInfo.wea}}</text>
						<text class="margin-lr">{{weatherInfo.tem}} °C</text>
						<text>{{weatherInfo.air_level}}</text>
					</template>
				</view>
			</view>
			<!-- map  -->
			<view class="main absolute ">
				<map class='w100 h100' id='myMap' :latitude="latitude" :longitude="longitude" show-location :scale='mapScale'
				 :markers="covers" @regionchange="regionchange" @markertap='markertap' />
			</view>
			<!-- 广告 -->
		<!-- 	<view v-show='addpuls' class="addpuls absolute">
				<view class="close" @click="hideadd">X</view>
				<button plain='true' class="btnphone" type="default" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber"></button>
				<image class='img' src="../../static/image/addpuls.jpg" mode=""></image>
			</view> -->
			<!-- mark 提示 -->
			<view v-if="markDetail" class="markDetail" @click="getSiteDetail">
				<view class="left ">
					<view class="text">
						<text>{{markDetail.goods_name}}</text>
						<text class="status">{{markDetail.goods_status.text}}</text>
					</view>
					<image class='img' src="../../static/image/l-c2.png" mode="widthFix"></image>
					<text class="tag">{{markDetail.goods_time}}</text>
				</view>
				<view class="right box flex a-center j-center flex-column" @click.stop.prevent="open">
					<image class="img" mode="" src="../../static/image/l-c1.png" alt=""></image>
					<text>{{distance}}</text>
				</view>
			</view>
			<view class="footer absolute flex j-between a-center flex-row bg-white">
				<view class="left  flex a-center j-center flex-column" @click="toPage('vip')">
					<image src="../../static/image/03.png" mode="" class="img"></image>
					<text>卡包</text>
				</view>
				<view class="mid flex j-center a-center flex-row" @click="scanCode">
					<image src="../../static/image/sao.png" class="img"></image>
					<text class="text bold">扫码洗车</text>
				</view>
				<view class="right  flex a-center j-center flex-column" @click="toPage('my')">
					<image src="../../static/image/02.png" mode="" class="img"></image>
					<text>我的</text>
				</view>
			</view>
			<view class="list-wrap fixed bg-white">
				<view class="box flex a-center j-center flex-column" @click="toPage('site')">
					<image src="../../static/image/06.png" class="img" mode="heightFix"></image>
					<text>站点列表</text>
				</view>
				<view class="box flex a-center j-center flex-column" @click="addressHandle">
					<image src="../../static/image/05.png" class="img img2" mode="heightFix"></image>
					<text>定位</text>
				</view>
				<view class="box flex a-center j-center flex-column" @click="isContact=true">
					<image src="../../static/image/04.png" class="img" mode="heightFix"></image>
					<text>客服</text>
				</view>
			</view>
			<view class="activity-wrap fixed" v-if="adImg" @click="toAdPage">
				<image :src="adImg" mode="" class="w100" mode="widthFix"></image>
			</view>
			<view class="contact-wrap fixed p-tblr" v-if="isContact" @click.stop.prevent="close">
				<view class="content absolute">
					<view class="contact-line text-center" @click.stop.prevent="online">
						<view class="relative">
							在线客服
							<text class="tag absolute">推荐</text>
						</view>
					</view>
					<view class="contact-line text-center" @click.stop.prevent="call">电话客服</view>
					<view class="contact-line text-center" @click.stop.prevent="close">取消</view>
				</view>
			</view>
		</template>
		<AuthLogin v-if="!isAuthAddress && isShowAuthLogin" @loginOk='loginOk' :status="'userLocation'"></AuthLogin>
	</view>
</template>

<script>
	import AuthLogin from "../../components/base/auth-login.vue"
	export default {
		components: {
			AuthLogin
		},
		data() {
			return {
				addpuls: true,
				adImg: "",
				mapScale: 16,
				isAuthAddress: false,
				isShowAuthLogin: false,
				phone: 0,
				isContact: false,
				weatherInfo: null,
				latitude: null,
				longitude: null,
				covers: [],
				mapCtx: null,
				addressInfo: null,
				fromPage: null,
				markDetail: null,
				distance: 0,
			}
		},

		onShareAppMessage(res) {
			if (res.from === 'button') { // 来自页面内分享按钮
				console.log(res.target)
			}
			return {
				title: '快来参加吧！',
				path: '/pages/index/index'
			}
		},
		onLoad(options) {
			this.fromPage = options && options.fromPage ? options.fromPage : null
			if (this.fromPage && this.fromPage === 'address') {
				this.addressInfo = JSON.parse(options.addressInfo)
				this.latitude = this.addressInfo.lat
				this.longitude = this.addressInfo.lng
				this.$tool.uniSetStorage("addressInfo", this.addressInfo)
			}

		},
		onReady() {
			this.init()
			this.findsiteUpdata() //检测站点更新
		},
		onHide() {
			this.markDetail = null; //切页面时隐藏信息
		},
		methods: {
			init(isReset = false) {

				this.$tool.isGetLocation('scope.userLocation', () => {
					this.isAuthAddress = true
					this.isShowAuthLogin = false
					if (this.fromPage && this.fromPage === 'address' && !isReset) {
						this.mapScale = 11
						this.getWeather()
						this.getPthone()
						this.getListInfo()
					} else {
						this.mapScale = 16
						this.getLocationInfo()
					}
					this.getAdInfo()
				}, () => {
					this.isAuthAddress = false
					this.isShowAuthLogin = true
				})
			},
			loginOk() {
				this.init()
			},
			addressHandle() {

				this.init(true)
			},
			getPthone() {
				this.$tool.uniRequest({
					url: `/api/Tel`,
					success: (res) => {
						this.phone = res.tel
					}
				})
			},
			getPhoneNumber(e) {
				if (!e.detail.iv) {
					this.$tool.uniShowToast({
						title: "获取失败！"
					})
					return false
				} else {
					this.$tool.uniRequest({
						url: "",
						data: {
							iv: e.detail.iv,
							encrypted_data: e.detail.encryptedData
						},
						success(resolve) {
							console.log(resolve)
						}
					})
					/* this.phone = "13649139296"
					this.userInfo.tel = this.phone
					this.setPhone('tel', this.phone) */
				}
				console.log(e)
				console.log(e.detail.iv)
				console.log(e.detail.encryptedData)
			},
			markertap(e) {
				let markerId = e.detail.markerId
				let result = null
				this.covers.forEach((item, index) => {
					item.iconPath = "../../static/image/maplocation.png"; //重置其他图标
					if (item.id == markerId) {
						result = item
						this.markColor(item, index) //改变点击颜色
					}
				})
				try { //重复点击判断
					if (result.goods_id == this.markDetail.goods_id) {
						return
					}
					result && this.getInfo(result.goods_id)
				} catch (e) {
					result && this.getInfo(result.goods_id)
				}
			},
			markColor(item, index) { //标注变色
				item.iconPath = "../../static/image/maplocation-on.png";
			},
			getInfo(detailId) {
				let that = this
				let addressInfo = this.$tool.uniGetStorage("addressInfo")
				this.$tool.uniRequest({
					url: `/api/goods/detail&goods_id=${detailId}`,
					params: {
						lat: addressInfo.lat,
						lng: addressInfo.lng
					},
					success: (res) => {
						that.markDetail = res.detail;
						that.distance = res.detail.goods_distance ? that.$tool.distanceHanlde(res.detail.goods_distance) : 0
					}
				})
			},
			regionchange(e) {
				//console.log(e)
				if (e.type == "end") {

				}
			},
			open() {
				uni.openLocation({
					latitude: parseFloat(this.markDetail.goods_lat),
					longitude: parseFloat(this.markDetail.goods_lng),
					name: this.markDetail.goods_name,
					address: this.markDetail.goods_df, //详细地址
					success: function() {
						console.log('success');
					}
				});

			},
			getSiteDetail() {
				let item = this.markDetail;
				this.$tool.uniNavigateTo({
					url: `/pages/index/site-detail?id=${item.goods_id}`
				})
			},
			toAdPage() {
				this.$tool.uniNavigateTo({
					url: `/pages/my/card`
				})
			},
			hideadd() {
				console.log(this.addpuls)
				this.addpuls = false;
			},
			findsiteUpdata() {
				let that = this;
				this.$tool.uniRequest({
					url: "/api/index/getconts",
					params: {
						wxapp_id: "10001",
					},
					success(res) {
						if (res) {
							const cover = that.$tool.uniGetStorage("covers") //缓存标记
							if (!cover) {
								return
							}
							const len = cover.length
							console.log(res.cont, len)
							if (res.cont != len) {
								console.log(res)
								that.$tool.uniRemoveStorage("covers") //清空缓存
								that.getListInfo();
							}
						}
					}
				})
			},
			getLocationInfo() {
				let _this = this
				this.mapCtx = uni.createMapContext('myMap')
				uni.getLocation({
					type: "wgs84",
					geocode: true,
					success: (res) => {
						_this.latitude = res.latitude
						_this.longitude = res.longitude
						_this.$tool.uniRequest({
							url: `/api/Geocoder`,
							params: {
								lat: _this.latitude,
								lng: _this.longitude
							},
							success: (result) => {
								console.log("城市", result)
								let cityName = result.geocoder.city
								if (cityName.charAt(cityName.length - 1) === '市') {
									cityName = cityName.substr(0, cityName.length - 1);
								}
								_this.addressInfo = {
									name: cityName,
									lat: _this.latitude,
									lng: _this.longitude,
									category_id: "",
								}
								_this.mapCtx.moveToLocation() //地图中心点切换到当前位置
								_this.$tool.uniSetStorage("addressInfo", _this.addressInfo)
								_this.getWeather()
								_this.getListInfo()
								_this.getPthone()
							}
						})

					}
				})
			},
			getAdInfo() {
				this.$tool.uniRequest({
					url: `/api/Ad`,
					success: (res) => {
						console.log('获取广告地址', res)
						this.adImg = res.indexAd
					}
				})
			},
			getWeather() {
				this.$tool.uniRequest({
					url: `/api/weather`,
					isNoCode: true,
					params: {
						lat: this.addressInfo.lat,
						lng: this.addressInfo.lng,
						city: this.addressInfo.name
					},
					success: (res) => {
						this.weatherInfo = res
					}
				})
			},
			getListInfo() {
				const cover = this.$tool.uniGetStorage("covers") //缓存标记
				if (cover) {
					this.covers = cover;
					return
				}
				this.$tool.uniRequest({
					url: `/api/index/`,
					success: (res) => {
						let temObj = res && res.posiList && res.posiList.data ? res.posiList.data : []
						this.covers = []
						for (let i in temObj) {
							let obj = {
								id: i + 1,
								width: "50rpx",
								height: "63rpx",
								goods_id: temObj[i].goods_id,
								latitude: temObj[i].goods_lat,
								longitude: temObj[i].goods_lng,
								iconPath: '../../static/image/maplocation.png'
							}
							this.covers.push(obj)
						}
						this.$tool.uniSetStorage("covers", this.covers)
						console.log("当前城市标记的站点：", this.covers)
					}
				})
			},
			scanCode() {
				uni.scanCode({
					success: (res) => {
						let result = res.result
						let siteId = ''
						if (result && result.startsWith('https://xi.ydeshui.com')) {
							let q = result
							if (q) {
								let a = q.split('?')[1]
								if (a && a.length > 0) {
									let b = a.split('=')
									if (b && b.length > 0 && b[0] == 'siteId') {
										siteId = b[1]
									}
								}
							}
						}
						if (siteId) {
							this.$tool.uniRedirectTo({
								url: `/pages/scan/index?siteId=${siteId}&fromPage=home`
							})
						} else {
							this.$tool.uniShowToast({
								title: "目前只支持小程序的扫码支付，不支持其他扫码",
								icon: "none"
							})
						}
					}
				})
			},
			online() {
				this.$tool.uniShowToast({
					title: "稍后开放！",
					icon: "none"
				})
			},
			toPage(type) {
				const pagesUrl = {
					"my": "/pages/my/index",
					"vip": "/pages/my/volume",
					"address": `/pages/address/index?addressName=${this.addressInfo.name}`,
					"site": "/pages/index/site"
				}
				let url = pagesUrl[type] || "/pages/index/index";
				this.$tool.uniNavigateTo({
					url
				})
			},
			call() {
				uni.makePhoneCall({
					phoneNumber: this.phone
				});
			},
			close() {
				this.isContact = false
			}
		}
	}
</script>

<style lang="less" scoped>
	/* #ifndef MY-ALIPAY*/

	/* #endif */
	.index {

		.header,
		.main,
		.footer {
			left: 0;
			right: 0;
		}

		.header {
			top: 0;
			padding: 0 40rpx;
			height: 100rpx;
			color: black;
			font-size: 26rpx;

			.left {
				cursor: pointer;

				.address {
					margin-right: 16rpx;
				}

				.more_icon {
					width: 24rpx;
					height: 24rpx;
					position: relative;
					top: 4rpx;
				}
			}

			.right {
				.margin-lr {
					margin: 0 20rpx;
				}
			}
		}

		.main {
			top: 100rpx;
			bottom: 100rpx;
		}

		.addpuls {
			width: 400rpx;
			height: 550rpx;
			bottom: 0;
			top: 0;
			left: 0rpx;
			right: 0;
			margin: auto;
			text-align: center;
			z-index: 9999;

			.btnphone {
				width: 100%;
				height: 100%;
				z-index: 8;
				position: absolute;
				border: none;
			}

			.close {
				width: 50rpx;
				height: 50rpx;
				position: absolute;
				z-index: 9;
				right: 20rpx;
				color: #fff;
				cursor: pointer;
			}

			.img {
				width: 100%;
				height: 100%;
			}
		}

		.markDetail {
			position: absolute;
			width: 80%;
			height: 100rpx;
			bottom: 140rpx;
			left: 0;
			right: 0;
			margin: auto;
			border-radius: 20rpx;
			background-color: #fff;
			border: 1rpx solid #ddd;
			padding: 10rpx 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 26rpx;

			.left {
				text-align: left;

				text {
					margin: 10rpx 0;
				}

				.status {
					padding: 8rpx;
					background: #ff893a;
					border-radius: 10rpx;
					margin-left: 10rpx;
				}

				.tag {
					border-radius: 20rpx;
					padding: 0 20rpx;
					vertical-align: middle;
				}

				.img {
					width: 30rpx;
					vertical-align: middle;
				}
			}

			.right {
				.img {
					width: 50rpx;
					height: 50rpx;
				}
			}
		}

		.footer {
			bottom: 0;
			height: 120rpx;
			padding: 0 100rpx;

			.mid {
				width: 320rpx;
				height: 100rpx;
				border-radius: 50rpx;
				background: #FF8D1A;

				.img {
					width: 50rpx;
					height: 50rpx;
					margin-right: 16rpx;
				}

				.text {
					font-size: 36rpx;
				}
			}

			.left,
			.right {
				color: black;
				font-size: 24rpx;
				line-height: 1.8;

				.img {
					width: 40rpx;
					height: 40rpx;
				}
			}

			.right {}
		}

		.list-wrap {
			color: black;
			width: 135rpx;
			height: 535rpx;
			right: 40rpx;
			bottom: 300rpx;
			border-radius: 20rpx;
			font-size: 12rpx;
			.box {
				height: 174rpx;
				font-size: 24rpx;

				&:last-child {
					height: 187rpx;
				}

				.img {
					height: 70rpx;
					width: 70rpx;
					margin-bottom: 10rpx;
				}

				.img2 {
					height: 80rpx;
					width: 80rpx;
					margin-bottom: 10rpx;
				}

				&:active {
					opacity: 0.6;
				}
			}
		}

		.activity-wrap {
			width: 710rpx;
			top: 120rpx;
			left: 50%;
			margin-left: -355rpx;
			border-radius: 10rpx;
		}

		.contact-wrap {
			z-index: 300;
			background: rgba(0, 0, 0, 0.2);

			.content {
				background: white;
				left: 0;
				right: 0;
				bottom: 0;
				height: 300rpx;
				border-top-left-radius: 8rpx;
				border-top-right-radius: 8rpx;

				.contact-line {
					height: 100rpx;
					line-height: 100rpx;
					box-sizing: border-box;

					&:nth-child(1) {
						border-bottom: 2rpx solid #272A2F;
					}

					&:nth-child(2) {
						border-bottom: 10rpx solid #272A2F;
					}

					.tag {
						font-size: 24rpx;
						color: red;
						top: -16rpx;
						left: 450rpx;

					}
				}
			}
		}
	}
</style>
