<template>
	<view class="card-detail">
		<view class="content" v-if='isLogin'>
			<view class="content" v-if="detail">
				<view class="header flex a-center j-center">
					<image :src="detail.images" class="img"></image>
				</view>
				<view class="info-wrap">
					<view class="line">
						{{detail.plan_name}}
					</view>
					<view class="line">
						{{detail.title}}
					</view>
					<view class="line1" @click="toListPage">
						查看适用站点（{{counts}}个）
					</view>
				</view>
				<view class="des-wrap" v-if="detail">
					详情介绍：
					<rich-text :nodes="strContent(detail)"></rich-text>
				</view>
				<view class="agreement-wrap flex a-center flex-row j-start">
					<text class="checkBox" @click="isAgreement=!isAgreement" :class="[isAgreement && 'isChecked']"></text>
					<text @click="isAgreement=!isAgreement">同意</text>
					<text class="font" @click="toAgreement">《服务协议》</text>
				</view> 
				<view class="btn-wrap flex a-center j-between flex-row">
					<view class="price-wrap">
						<text class="price1">总价 ￥{{detail.money}}</text>
						<text class="price2 text-price">{{detail.del_money}}</text>
					</view>
					<u-button :loading="loading" shape='circle' type="warning" class="" ripple='true' @click="getGlobl">立即支付</u-button>
				</view>
			</view>
		</view>
		<AuthLogin v-if="!isLogin && isShowAuthLogin" @loginOk='loginOk' :status="'userInfo'"></AuthLogin>
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
				isLogin: false,
				isShowAuthLogin: false,
				detail: null,
				isAgreement: true,
				suid: null,
				detailId: null,
				counts: 0,
				site: null,
				loading: false,
			}
		},
		onLoad(options) { //xi.ydeshui.com/?uId=1$tid=1
			let q = options.q ? decodeURIComponent(options.q) : null
			if (q) {
				let param = q.split('?')[1]; //uId=1$tid=1 $ uId=1$tid=1
				let a = param.split('$'); //uId=1 $ tid=1 $ uId=12449 $ tid=10014
				if (a && a.length > 2) {
					this.suid = a[2].split('=')[1];
					this.detailId = a[3].split('=')[1];
				}
			} else {
				this.detailId = options.id;
				this.suid = options.uid;
			}
			this.init();
			this.getDetail();

		},
		methods: {
			init() { //登录
			/*授权登录start*/
				this.$tool.isGetLocation("scope.userInfo", () => { //授权登录
					console.log('logged')
					this.logged(); 
				}, () => { //未登录
					console.log('fail')
					this.isLogin = false
					this.isShowAuthLogin = true
				})
			/*end*/
			},
			loginOk() {
				this.logged()
			},
			logged() {
				let _this = this;
				//获取addressInfo
				this.getLocationInfo();//扫码注册进入本页面就没有位置信息
				this.isLogin = true;
				this.isShowAuthLogin = false;
			},
			getGlobl() { //获取全局数据
				/*
				this.site =this.$store.state.site;
				if (this.site == null && !this.suid) { ///预请求未成功时///无邀请人,不请求附近站点
					this.loading = true; //按钮动画
					let res = this.$cache.get('_addressInfo'); //获取当前经纬度
					let _this = this;
					this.getStorageListSite({ //请求最近站点列表
						latitude: res.lat,
						longitude: res.lng,
					}, (res) => {
						_this.loading = false;
						_this.$cache.set('_site', res); //缓存
						getApp().globalData._site = res.posiList[0];
						_this.site = res.posiList[0]; //第一个站点
						_this.pay(); //发起支付
					})
				} else {
					this.pay();
				}
				**/
				this.pay();
			},
			getLocationInfo() {
				let _this = this
				uni.getLocation({ //获取位置信息
					type: "wgs84",
					geocode: true,
					success: (res) => {
						_this.latitude = res.latitude; //纬度
						_this.longitude = res.longitude; //经度
						_this.addressInfo = {
							lat: _this.latitude,
							lng: _this.longitude,
							category_id: "",
						}
						_this.$cache.set("_addressInfo", _this.addressInfo)
					}
				})
			},
			getStorageListSite(location, success) { //预先获取附近站点
				let _this = this;
				//请求之前清除缓存
				this.$cache.delete('_site');
				this.$tool.uniRequest({
					url: `/api/index/page`,
					params: {
						lat: String(location.latitude),
						lng: String(location.longitude)
					},
					loading: false,
					success: success
				})
			},
			strContent(detail) {
				if (!detail || !detail.content) return ''
				let str = this.$tool.htmlre(detail.content)
				return str
			},
			getDetail() {
				let _this = this
				this.$tool.uniRequest({
					url: `/api/recika/detail`,
					params: {
						recika_id: this.detailId,
						suid: this.suid || '',
					},
					success: (res) => {
						this.detail = res.detail[0]
						this.counts = res.detail[0].goodscount || 0
					}
				})
			},
			toListPage() {
				this.$tool.uniNavigateTo({
					url: `/pages/index/site?coupon_id=${this.detail.coupon_id}`
				})
			},
			toAgreement() {
				this.$tool.uniNavigateTo({
					url: '/pages/base/rich?fromPage=serviceAgreement'
				})
			},
			pay() {
				if (!this.isAgreement) {
					this.$tool.uniShowToast({
						title: "同意才能支付！",
						icon: 'none'
					})
					return
				}
				let params;
				if(!this.suid){
					params = {
						suid: this.suid || '', //分享用户id
						planId: this.detail.plan_id,
						customMoney: this.detail.gift_money,
						dizhi: '' ,// this.site.goods_name ,
						dizhi_id:'' ,// this.site.goods_id,
						suname: this.detail.suname || '',
					}
				}else{//有分享人，不请求附件站点
					params = {
						suid: this.suid || '', //分享用户id
						planId: this.detail.plan_id,
						customMoney: this.detail.gift_money,
						dizhi:'',
						dizhi_id: '',
						suname: this.detail.suname || '',
					}
				}
				console.log("支付参数", params)
				let _this = this
				this.$tool.uniRequest({
					url: `/api/recika/submit`,
					method: "POST",
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					params: params,
					success: (res) => {
						let result = res.payment
						_this.$tool.wxPayMoney(result.timeStamp, result.nonceStr, result.prepay_id, 'MD5', result.paySign, (req) => {
							_this.$tool.uniShowToast({
								title: "支付成功！",
							})
							console.log("支付成功", res)
							setTimeout(() => {
								_this.$tool.uniRedirectTo({
									url: "/pages/my/volume"
								})
							}, 1000)
						})

					}
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	page {
		.card-detail {
			height: 100%;
		}
	}

	.card-detail {
		.content {
			padding-bottom: 150rpx;

			.header {
				margin: 20rpx 0;

				.img {
					width: 600rpx;
					height: 360rpx;
					border-radius: 10rpx;
				}
			}

			.info-wrap {
				padding: 20rpx 40rpx;
				border-bottom: 20rpx solid #F2F2F2;

				.line {
					font-size: 34rpx;
					line-height: 2;
				}

				.line1 {
					font-size: 34rpx;
					color: #FF8D1A;
					line-height: 2;
				}
			}

			.des-wrap {
				padding: 20rpx 40rpx;
				border-bottom: 2rpx solid #F2F2F2;
				font-size: 30rpx;
			}

			.agreement-wrap {
				padding: 20rpx 40rpx;
				font-size: 28rpx;

				.font {
					color: #2A82E4;
					display: inline-block;
					margin-left: 20rpx;
				}

				.checkBox {
					display: inline-block;
					width: 32rpx;
					height: 32rpx;
					border-radius: 50%;
					border: 2rpx solid #FF8F1E;
					margin-right: 10rpx;
					position: relative;
				}

				.checkBox.isChecked::after {
					content: '';
					width: 20rpx;
					height: 20rpx;
					border-radius: 50%;
					background: #FF8F1E;
					position: absolute;
					top: 5rpx;
					left: 5rpx;
				}
			}

			.btn-wrap {
				position: fixed;
				bottom: 0;
				left: 0;
				right: 0;
				background: white;
				height: 120rpx;
				padding: 0 40rpx;
				border-top: 2rpx solid #F2F2F2;

				.price-wrap {

					.price1 {
						font-size: 32rpx;
						color: #FF972F;
						display: inline-block;
						margin-right: 30rpx;
					}

					.price2 {
						font-size: 26rpx;
						color: #A6A6A6;
						text-decoration: line-through;
					}
				}

				.btn {
					padding: 20rpx 40rpx;
					color: white;
					background: #FF8D1A;
					border-radius: 50000rpx;
					font-size: 28rpx;
				}
			}
		}
	}
</style>
