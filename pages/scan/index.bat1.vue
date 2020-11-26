<template>
	<view class="wrap">
		<view class="main" v-if='isLogin && !loading'>
			<u-steps active-color="#ff893a" :list="numList" :current="current" mode="number"></u-steps>
			<scroll-view :style="{ height:winHeight }" :scroll-into-view="toView" scroll-y="true">
				<view class="detail">
					<view class="">
						{{detail1}}
					</view>
					<view>{{detail2}}</view>
				</view>
				<view class="conter">
					<view v-if="current == 0" class="box">
						<image class="img" src="../../static/image/current1.png" mode='aspectFit'></image>
					</view>
					<view v-else-if="current == 1" class="box">
						<u-grid :col="3" :border="false">
							<u-grid-item>
								<image class="g" src="../../static/image/shoucha.png" mode="aspectFit"></image>
								<view class="grid-text ">拉手刹</view>
							</u-grid-item>
							<u-grid-item>
								<image class="g" src="../../static/image/weibiaoti-1-03.png" mode="aspectFit"></image>
								<view class="grid-text ">挂P档</view>
							</u-grid-item>
							<u-grid-item>
								<image class="g" src="../../static/image/yushua.png" mode="aspectFit"></image>
								<view class="grid-text ">关雨刷</view>
							</u-grid-item>
						</u-grid>
						<u-grid :col="3" :border="false">
							<u-grid-item>
								<image class="g" src="../../static/image/tianxian.png" mode="aspectFit"></image>
								<view class="grid-text ">收天线</view>
							</u-grid-item>
							<u-grid-item>
								<image class="g" src="../../static/image/rearviewmirror.png" mode="aspectFit"></image>
								<view class="grid-text ">收后视镜</view>
							</u-grid-item>
							<u-grid-item>
								<image class="g" src="../../static/image/chechuang.png" mode="aspectFit"></image>
								<view class="grid-text ">关车窗</view>
							</u-grid-item>
						</u-grid>
						<view class='bottom'>
							<u-modal v-model="air" content="请先勾选同意后进行下一步" @confirm="confirm"></u-modal>
							<u-radio-group v-model="value" id="productBox">
								<u-radio name="pact">
									我已阅读并同意<text class="textBlue" @click="rich">《走您洗车用户服务协议》</text>
								</u-radio>
							</u-radio-group>
						</view>
					</view>
					<view v-else class="box3">
						<view class="text">请选择洗车方式</view>
						<view class="flex lable a-center">
							<view :class="index == 0? 'active':''" class="priceList felx " @click="hasActive(0)">
								<view></view>
								<!-- {{price}}元 -->
								<view>标准速洗</view>
								<view>5分钟</view>
							</view>
							<!-- <view :class="index == 1? 'active':''" class="priceList flex" @click="hasActive(1)">
							<view>13.8元</view>
							<view>水蜡速洗</view>
							<view>5分钟</view>
						</view>
						<view :class="index == 2? 'active':''" class="priceList flex" @click="hasActive(2)">
							<view>16.8元</view>
							<view>亮光精洗</view>
							<view>7分钟</view>
						</view> -->
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
					<u-button v-if="current < 2" :disabled="disable" :loading="loadingChaPost" type="warning" @click="next">下一步</u-button>
					<u-button v-if='current == 2' type="warning" @click="pay">开始洗车</u-button>
				</view>
			</scroll-view>
		</view>
		<AuthLogin v-if="!isLogin && isShowAuthLogin" @loginOk='loginOk' :status="'userInfo'"></AuthLogin>
		<Urgent v-if='loading' :zhan='zhanId'></Urgent>
	</view>
</template>

<script>
	import AuthLogin from "../../components/base/auth-login.vue"
	import Urgent from './urgent/urgent.vue'
	export default {
		components: {
			AuthLogin,
			Urgent
		}, 
		data() {
			return {
				src: '../../static/audio.mp3',
				zhanId: 0,
				loading: false,
				audioCtx: null,
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
				},
				winHeight: null,
				chaPost:null,
				loadingChaPost:true,//下一步
				disable:false,
				toView: '', //锚点跳转的ID
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
				this.current = option.curr || 0;
				this.init()
			};
			let that = this;
			this.$api.scan_indexChaPost({
				zhan_id: this.siteId
			}).then(result => {
				that.chaPost = result;
				that.loadingChaPost = false;
			}).catch( error => {
				that.loadingChaPost = false;
				that.disable = true;
				uni.showModal({
					title:'提示',
					content:error.msg,
					success:(res)=>{
						if (res.confirm) {
							
						} else if (res.cancel) {
							
						}
					}
				})
			});
			wx.getSystemInfo({
				success: function(res) {
					//屏幕的宽度/屏幕的高度 = 微信固定宽度(750)/微信高度
					that.winHeight = res.windowHeight - (res.windowWidth * 90 / 750) + 'px';
				}
			});
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
		methods: {
			hasActive(item) {
				this.$tool.uniShowToast({
					icon: 'none',
					title: "暂不支持！"
				})
				return;
				this.index = item;
			},
			rich() {
				this.$tool.uniNavigateTo({
					url: `/pages/base/rich?fromPage=serviceAgreement`
				})
			},
			init() {
				this.$tool.isGetLocation("scope.userInfo", () => { //登录
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
			confirm() {
				this.air = false;
			},   
			next(e) {
				if (this.current == 1) {
					if (this.value != 'pact') {
						this.air = true;
						this.toView = 'productBox';
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
						//console.log("res", res)
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
			async pay() {
				let _this = this
				let params = {
					wxapp_id: "10001",
					goods_id: this.siteId,
					coupon_id: this.couponInfoPrice.couponId,
					pay_type: '20'
				};
				const buyNow = await this.$api.buyNow(params);
				this.zhanId = buyNow.msg.success; //站点id//1开机2暂停3复位
				let res = buyNow.data;
				if (res.pay_type === '20') { //微信支付
					let result = res.payment
					_this.$tool.wxPayMoney(result.timeStamp, result.nonceStr, result.prepay_id, 'MD5', result.paySign, (req) => {
						_this.payGo(buyNow);
					})
				} else if (res.pay_type === '30') { //优惠卷支付
					_this.payGo(buyNow);
				}
			},
			payGo(option) { //支付成功
				let res = option.data,
					msg = option.msg;
				let _this = this;
				this.$tool.uniShowToast({
					title: "支付成功！"
				})
				setTimeout(() => {
					if (msg.success != 0) {
						_this.$api.scan_indexZhan({
							zhan_id: msg.success,
							zhan_type: 1, //1开机2暂停3复位
						}).then(res => {
							if(res.code == 0){
								uni.showModal({
								    title: '提示',
								    content: res.msg,
								    success: function (res) {
								        uni.reLaunch({
								        	url: `/pages/scan/order-detail?id=${res.order_id}`
								        })
								    }
								});
								return
							}
							_this.loading = true; //开机成功，进入紧急停止页面
						})
					} else {
						uni.reLaunch({
							url: `/pages/scan/order-detail?id=${res.order_id}`
						})
					}

				}, 1000)
			},
		}
	}
</script>

<style lang="less" scoped>
	.textBlue {
		color: #1b49ec;
	}

	page {
		height: 100%;

		.wrap {
			height: 100%;
		}
	}

	.grid-text {
		font-size: 28rpx;
		margin-top: 4rpx;
		color: #000;
	}

	.line-box {
		margin: 30rpx 0;
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


				.g {
					width: 100rpx;
					height: 180rpx;
				}


				.img {
					width: 100%;
					min-height: 600rpx;
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
					justify-content: space-around;

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
