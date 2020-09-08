<template>
	<view class="wrap">
		<audio v-show="false"  :src="src" controls='false' id='audio'></audio>
		<view class="main" v-if='isLogin'>
			<u-steps active-color="#ff893a" :list="numList" :current="current" mode="number"></u-steps>
			<view class="detail">
				<view class="">
					{{detail1}}
				</view>
				<view>{{detail2}}</view>
			</view>
			<view class="conter">
				<view v-if="current == 0" class="box">
					<image class="img" src="../../static/image/current1.png" mode=""></image>
				</view>
				<view v-else-if="current == 1" class="box">
					<image class="imgs" src="../../static/image/two.png" mode=""></image>
					<text>以下车型不能清洗</text>
					<image class="imgs2" src="../../static/image/car1.png" mode=""></image>
					<view class='bottom'>
						<transition name="fade">
							<image v-show="air" src="../../static/image/air.png" class="imgs3" mode=""></image>
						</transition>
						<u-radio-group v-model="value">
							<u-radio name="pact">
								我已阅读并同意《走您洗车用户服务协议》
							</u-radio>
						</u-radio-group>
					</view>
				</view> 
				<view v-else class="box3">
					<view class="text">请选择洗车方式</view>
					<view class="flex lable">
						<view :class="index == 0? 'active':''" class="priceList felx " @click="hasActive(0)">
							<view>{{price}}元</view>
							<view>标准速洗</view>
							<view>3分钟</view>
						</view>
						<view :class="index == 1? 'active':''" class="priceList flex" @click="hasActive(1)">
							<view>13.8元</view>
							<view>水蜡速洗</view>
							<view>5分钟</view>
						</view>
						<view :class="index == 2? 'active':''" class="priceList flex" @click="hasActive(2)">
							<view>16.8元</view>
							<view>亮光精洗</view>
							<view>7分钟</view>
						</view>
					</view>
					<view class="flex li">
						<view>车牌号</view>
						<view>{{carCard}}</view>
					</view>
					<view class="flex li">
						<view>洗车类型</view>
						<view>常规车辆</view>
					</view>
					<view class="flex li">
						<view>支付方式</view>
						<view>微信支付</view>
					</view>
					<view class="flex li">
						<view>优惠方式</view>
						<view class="red flex1 inline-block" @click="selectCupon">
							{{mess}}
							<image src="../../static/image/more1.png" class="img-c"></image>
						</view>
					</view>
					<view class="flex li">
						<view>优惠金额</view>
						<view>￥{{couponInfoPrice.price}}</view>
					</view>
					<view class="flex li">
						<view>支付金额</view>
						<view>{{price}}</view>
					</view>
				</view>
			</view>
			<view class="btn">
				<u-button v-if="current < 2" type="warning" @click="next">下一步</u-button>
				<u-button v-if='current == 2' type="warning" @click="pay">开始洗车</u-button>
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
				src:'../../static/audio.mp3', 
				audioCtx:null,
				index: 0,
				isLogin: false,
				isShowAuthLogin: false,
				siteId: null,
				detail: null,
				carCard: '',
				price: 0,
				couponList: [],
				air: false,
				value: '',
				current: 0,
				numList: [{
					name: ''
				}, {
					name: ''
				}, {
					name: ''
				}, ],
				couponInfoPrice: {
					couponId: 0,
					price: 0,
					name: ""
				}
			}
		},
		onLoad(option) {
			let q = option.q ? decodeURIComponent(option.q) : null
			let fromPage = option.fromPage;
			if (q) {
				let a = q.split('?')[1]
				if (a && a.length > 0) {
					let b = a.split('=')
					if (b && b.length > 0 && b[0] == 'siteId') {
						this.siteId = b[1]
						this.init()
					}
				}
			} else if ((fromPage === 'addCar' || fromPage === 'home') && option.siteId) {
				this.siteId = option.siteId
				this.init()
			} else if (fromPage === 'select' && option.siteId) {
				this.siteId = option.siteId
				this.couponInfoPrice.couponId = option.userCouponId
				this.init()
			}
			
			this.audioCtx = uni.createAudioContext('audio');
			this.audioCtx.play()
		},
		computed: {
			mess: function() {
				if (this.couponList.length <= 0) {
					return `你有${this.couponList.length}张优惠券可使用`
				};
				let select = this.couponInfoPrice.couponId;
				var obj;
				for (let i = 0; i < this.couponList.length; i++) {
					var temp = this.couponList[i];
					if (temp.user_coupon_id == select) {
						obj = temp;
					}
				}
				let message = obj.coupon_type.text == '次卡' ? '免费洗车' : obj.name;
				return message
			},
			detail1() {
				if (this.current == 0) {
					return `确认车辆是否停到指定位置`
				}
				if (this.current == 1) {
					return `确认完成以下操作`
				}
				if (this.current == 2) {
					return `确认订单信息`;
				}
			},
			detail2() {
				if (this.current == 0) {
					return `通过洗车两侧辅助镜查看`
				}

				if (this.current == 1) {
					return `确保洗车过程中车辆安全`
				}
				if (this.current == 2) {
					return ``;
				}
			}
		},
		watch: {
			value: function(e) {
				if (e == 'pact') {
					this.air = false
				}
			}
		},
		methods: {
			hasActive(item) {
				this.$tool.uniShowToast({
					icon:'none',
					title: "暂不支持！"
				})
				return;
				this.index = item;
			},
			init() {
				this.$tool.isGetLocation("scope.userInfo", () => {
					this.logged()
				}, () => {
					this.isLogin = false
					this.isShowAuthLogin = true
				})
			},
			loginOk() {
				this.logged()
			},
			selectCupon() { //优惠方式
				let url =
					`/pages/scan/select?list=${JSON.stringify(this.couponList)}&userCouponId=${this.couponInfoPrice.couponId}&siteId=${this.siteId}`
				this.$tool.uniNavigateTo({
					url
				})
			},
			next() {
				if (this.current == 1) {
					if (this.value != 'pact') {
						this.air = true;
						return;
					}
				}
				this.current = this.current + 1;
			},
			sequence() { //排序
				let arr = this.couponList;
				let len = arr.length;
				if (len <= 0) {
					return
				}
				for (var i = 0; i < len; i++) {
					for (var j = 0; j < len - 1 - i; j++) {
						if (arr[j].reduce_price * 1 < arr[j + 1].reduce_price * 1) { //相邻元素两两对比
							var temp = arr[j + 1]; //元素交换
							arr[j + 1] = arr[j];
							arr[j] = temp;
						}
					}
				}
				this.couponList = arr; //排序后
				let option = {
					fromPage: "select",
					siteId: this.siteId,
					userCouponId: arr[0].user_coupon_id
				} //传入优惠卷id
				let fromPage = option.fromPage
				if (fromPage === 'select' && option.siteId) {
					this.siteId = option.siteId
					this.couponInfoPrice.couponId = option.userCouponId
					this.init()
				}
			},
			logged() {
				let _this = this
				this.$tool.uniRequest({
					url: `/api/order/buyNow`,
					params: {
						goods_id: this.siteId,
						coupon_id: this.couponInfoPrice.couponId, //默认值为0，选择后传优惠券ID
						goods_sku_id: '0'
					},
					success: (res) => {
						console.log("res", res)
						if (res.exist_car) { //是否有添加车
							_this.detail = res.goods_list[0]
							_this.couponList = res && res.coupon_list ? res.coupon_list : []
							_this.carCard = res.car ? res.car : ''
							_this.price = res.order_pay_price
							_this.couponInfoPrice.price = res.coupon_money
							_this.isLogin = true
							_this.isShowAuthLogin = false
							if (res.coupon_money == 0) {
								_this.sequence(); //排序默认选中
							}

						} else {
							_this.$tool.uniRedirectTo({
								url: `/pages/base/add-car?siteId=${this.siteId}&pageForm=scan&status=add`
							})
						}
					}
				})
			},
			pay() {
				let _this = this
				let params = {
					wxapp_id: "10001",
					goods_id: this.siteId,
					coupon_id: this.couponInfoPrice.couponId,
					pay_type: '20'
				}
				console.log("支付参数", params)
				this.$tool.uniRequest({
					url: `/api/order/buyNow`,
					method: "POST",
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					params: params,
					success: (res) => {
						if (res.pay_type === '20') { //微信支付
							let result = res.payment
							_this.$tool.wxPayMoney(result.timeStamp, result.nonceStr, result.prepay_id, 'MD5', result.paySign, (req) => {
								_this.$tool.uniShowToast({
									title: "支付成功！"
								})
								setTimeout(() => {
									uni.reLaunch({
										url: `/pages/scan/order-detail?id=${res.order_id}`
									})
								}, 1000)
							})
						} else if (res.pay_type === '30') { //优惠卷支付
							_this.$tool.uniShowToast({
								title: "支付成功！"
							})
							setTimeout(() => {
								uni.reLaunch({
									url: `/pages/scan/order-detail?id=${res.order_id}`
								})
							}, 1000)
						}
					}
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	page {
		height: 100%;

		.wrap {
			height: 100%;
		}
	}

	.main {
		padding-top: 40rpx;

		.detail {
			width: 80%;
			margin: auto;
			text-align: center;
			padding: 40rpx;
		}

		.conter {
			width: 100%;
			margin-bottom: 30rpx;
			min-height: 800rpx;

			.box {
				width: 100%;
				text-align: center;
				padding: 40rpx;
				padding-bottom: 0rpx;

				.img {
					width: 100%;
					min-height: 700rpx;
				}

				.imgs {
					width: 100%;
					height: 360rpx;
					border-radius: 10rpx;
				}

				.imgs2 {
					width: 100%;
					height: 300rpx;
					border-radius: 10rpx;
				}

				.bottom {
					width: 100%;
					text-align: left;

					.fade-enter-active,
					.fade-leave-active {
						transition: opacity .5s;
					}

					.fade-enter,
					.fade-leave-to

					/* .fade-leave-active below version 2.1.8 */
						{
						opacity: 0;
					}

					.imgs3 {
						width: 60%;
						height: 100rpx;
					}
				}
			}

			.box3 {
				width: 90%;
				margin: auto;

				.active {
					background-color: #F0AD4E;
				}

				.flex {
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				.text {
					padding: 0rpx 0 20rpx;
					color: #ddd;
				}

				.lable {
					margin-bottom: 20rpx;

					.priceList {
						height: 200rpx;
						width: calc(100% / 3.5);
						border: 1px solid #F0AD4E;
						border-radius: 20rpx;
						text-align: center;
						padding: 20rpx;
						flex-flow: wrap column;
						align-items: center;
						line-height: 50rpx;

					}
				}

				.li {
					padding: 20rpx 0;
					border-bottom: 1px solid #ddd;

					.flex1 {
						text-align: right;
						color: red;
					}

					.img-c {
						width: 30rpx;
						height: 30rpx;
						margin-left: 10px;
						position: relative;
						top: 2rpx;
						transform: rotate(-90deg);
					}
				}
			}

		}

		.btn {
			width: 90%;
			margin: 20rpx auto;
		}
	}
</style>
