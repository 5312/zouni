<template>
	<!--  -->
	<view class="my bg-page h100 relative" >
		<template v-if="isLogin">
			<view class="header-wrap bg-gradual-orange flex a-center j-start flex-column" @click="myInfoPage">
				<view class="top radius "><image :src="userInfo.avatarUrl" mode="aspectFill" class="avatar w100 h100" v-if="userInfo"></image></view>
				<view class="bottom">
					<view class="name">{{ userInfo.nickName || '登陆' }}</view>
				</view>
				<image class="gif-black gifimg" src="../../static/image/wave.gif" mode="scaleToFill" height="25rpx"></image>
			</view>
			<view class="nav-wrap my-shadow flex a-center flex-row j-start absolute ">
				<view class="nav flex a-center flex-column j-center " hover-class="active" @click="toPage('order')">
					<image src="../../static/image/my-order.png" class="icon"></image>
					<text class="nav-text">我的订单</text>
				</view>
				<view :class="{ 'animation-shake': shake }" class=" nav flex a-center flex-column j-center" hover-class="active" @click="toPage('vip')">
					<image src="../../static/image/my-money.png" class="icon"></image>
					<text class="nav-text">钱包</text>
				</view>
				<view class="nav flex a-center flex-column j-center" hover-class="active" @click="toPage('volume')">
					<image src="../../static/image/my-juan.png" class="icon"></image>
					<text class="nav-text">优惠券</text>
				</view>
			</view>
			<view class="list-wrap absolute ">
				<template v-for="(item, index) in myList">
					<view
						hover-class="bg-list"
						class="line flex a-center flex-row j-between "
						:class="[index == 2 || index == 5 || index == myList.length - 1 ? '' : 'line-boder-bottom']"
						:key="index"
						@click="toListPage(item)"
					>
						<view class="left flex a-center flex-row j-start">
							<img :src="item.img" alt="icon" class="icon" />
							<text class="name">{{ item.name }}</text>
						</view>
						<view class="right flex flex-row  a-center j-end">
							<text v-if="item.info" class="right-info">{{ item.info }}</text>
							<img src="../../static/image/show1.png" class="show-icon" />
						</view>
					</view>
					<view class="tar-h" v-if="index == 2 || index == 5" :key='index+10'></view>
				</template>
			</view>
			<view class="contact-wrap fixed p-tblr" v-if="isContact" @click.stop.prevent="close">
				<view class="content absolute">
					<view class="contact-line text-center">{{ phone }}</view>
					<view class="contact-line text-center" @click.stop.prevent="call">呼叫</view>
					<view class="contact-line text-center" @click.stop.prevent="close">取消</view>
				</view>
			</view>
		</template>
		<!-- 登录 -->
		<AuthLogin v-if="!isLogin && isShowAuthLogin" @loginOk="loginOk" :status="'userInfo'"></AuthLogin>
		<!-- 弹窗提示 -->
		<view class="mask flex j-center a-center" v-if="isCouponCounts">
			<view class="contnet flex flex-column a-center j-between">
				<view class="close-wrap" @click="isCouponCounts = false">
					<u-icon name="close" size="40rpx"></u-icon>
				</view>
				<view class="title">恭喜，你还有{{ list.length }}张优惠券未使用！</view>
				<view class="content">
					<view class="box shadow-warp flex a-center j-start flex-row" v-for="(item, index) in list" :key="index">
						<view class="left">
							<text class="tar">{{ item.coupon_type.value == 10 ? `1次` : item.coupon_type.value == 20 ? `¥${item.reduce_price.split('.')[0]}` : '' }}</text>
						</view>
						<view class="right">
							<view class="p">{{ item.coupon_type.text }}</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import AuthLogin from '../../components/base/auth-login.vue';
export default {
	components: {
		AuthLogin
	},
	data() {
		return {
			shake: false, //摇头动画
			isLogin: false,
			couponCounts: 0,
			isShowAuthLogin: false,
			isContact: false,
			phone: 0,
			userInfo: null,
			orderCount: null,
			list: null,
			isCouponCounts: false,
			myList: [
				{
					img: '../../static/image/11.png',
					name: '我的车辆',
					path: '/pages/my/my-car'
				},
				{
					img: '../../static/image/my-yao.png',
					name: '邀请好友',
					info: '',
					isNoOpen: false,
					path: '/pages/base/share'
				},
				{
					img: '../../static/image/my-juan.png',
					name: '优惠券兑换',
					isNoOpen: true
				},
				{
					img: '../../static/image/my-juan.png',
					name: '优惠券核销', 
					isNoOpen: false,
					path:'/pages/base/writeOff'
				},
				{
					img: '../../static/image/08.png',
					name: '关于我们',
					path: '/pages/base/rich?fromPage=about'
				},
				{
					img: '../../static/image/09.png',
					name: '联系我们',
					prop: 'contact'
				},
				{
					img: '../../static/image/10.png',
					name: '服务协议',
					path: '/pages/base/rich?fromPage=serviceAgreement'
				},
				{
					img: '../../static/image/help.png',
					name: '帮助中心',
					path: '/pages/my/help'
				}
			]
		};
	},
	onLoad() {
		this.init();
	},
	onShow() {
		let isEditUserInfo = this.$cache.get('_isEditUserInfo');
		if (isEditUserInfo) {
			this.$cache.delete('_isEditUserInfo');
			this.init();
		}
	},
	methods: {
		init() {
			this.$tool.isGetLocation(
				'scope.userInfo',
				() => {
					this.getNewToken();
				},
				() => {
					this.isLogin = false;
					this.isShowAuthLogin = true;
				}
			);
		},
		myInfoPage() {
			if (!this.userInfo) {
				this.$tool.getTokenValue({
					success: () => {
						this.getNewToken();
					}
				});
			} else {
				this.$tool.uniNavigateTo({
					url: '/pages/my/my-info'
				});
			}
		},
		getNewToken() {
			this.logged();
		},
		loginOk() {
			this.getNewToken();
		},
		getStyle(item) {
			let style = {};
			style.backgroundColor = item.color.text;
			return style;
		},
		getCouponCounts() {
			this.isCouponCounts = false;
			this.$tool.uniRequest({
				url: `/api/user.coupon/lists&data_type=not_use`,
				success: res => {
					this.isCouponCounts = res && res.list.length > 0 ? true : false;
					this.couponCounts = res && res.list.length > 0 ? res.list.length : 0;
					this.list = res && res.list ? res.list : [];
					
				}
			});
		},
		getPthone() {
			this.$tool.uniRequest({
				url: `/api/Tel`,
				success: res => {
					this.phone = res.tel;
				}
			});
		},
		logged() {
			let _this = this;
			this.$tool.uniRequest({
				url: `/api/user.index/detail`,
				params: {
					wxapp_id: '10001',
					token: this.$cache.get('_token')
				},
				success: res => {
					_this.userInfo = res.userInfo;
					_this.orderCount = res.orderCount;
					_this.isLogin = true;
					_this.isShowAuthLogin = false;
					_this.getCouponCounts();
					_this.getPthone();
				}
			});
		},
		toPage(type) {
			if (type === 'vip') {
				this.$tool.uniShowToast({
					title: '稍后开放！',
					icon: 'none'
				});
				this.shake = true;
				setTimeout(() => {
					this.shake = false;
				}, 500);
				return;
			}
			let pageType = {
				volume: '/pages/my/volume',
				vip: '/pages/vip/index',
				order: '/pages/my/order'
			};
			let url = pageType[type] ? pageType[type] : '/pages/index/index';
			this.$tool.uniNavigateTo({
				url
			});
		},
		toListPage(item) {
			if (item.isNoOpen) {
				this.$tool.uniShowToast({
					title: '稍后开放！',
					icon: 'none'
				});
				return;
			}
			if (item.path) {
				this.$tool.uniNavigateTo({
					url: item.path
				});
			} else if (item.prop === 'invoice') {
				uni.showModal({
					title: '温馨提示',
					content: '请按照如下提示获取发票',
					success: function(res) {
						if (res.confirm) {
							console.log('用户点击确定');
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			} else if (item.prop === 'contact') {
				this.isContact = true;
			}
		},
		close() {
			this.isContact = false;
		},
		call() {
			uni.makePhoneCall({
				phoneNumber: this.phone
			});
		}
	}
};
</script>

<style lang="scss" scoped>
@import '/colorui/animation.css';
.my-shadow{
	    box-shadow: 0 9rpx 10rpx rgba(0, 0, 0, 0.1);
}
.my {
	background-color: #f2f2f291;
	.mask {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 99999;

		.contnet {
			background: white;
			width: 560rpx;
			height: 550rpx;
			padding: 30px;
			border-radius: 20rpx;
			box-sizing: border-box;
			position: relative;

			/* 全部显示优惠卷 */
			.content {
				padding-top: 5px;
				height: 340rpx;
				overflow: auto;
				.box {
					margin: 10px 20px;
					border-radius: 14rpx;
					height: 100rpx;
					border: 1rpx solid #ddd;
					background-color: #ffffff;

					.left {
						flex: 1;
						height: 100%;
						padding: 0 30rpx;
						line-height: 100rpx;
						border-radius: 14rpx;
						border-top-right-radius: 0;
						border-bottom-right-radius: 0;
						text-align: center;
						background-color: #ffa537;
						.tar {
							font-size: 40rpx;
							font-weight: 900;
							white-space: nowrap;
						}
					}
					.right {
						position: relative;
						width: 300rpx;
						text-align: center;
						font-size: 28rpx;
						flex-shrink: 0;
						height: 100%;
						line-height: 100rpx;
					}
					&:nth-child(1) {
						margin-top: 0;
					}
				}
			}

			.close-wrap {
				position: absolute;
				right: 8rpx;
				top: 13rpx;
				width: 50rpx;
				height: 50rpx;
				text-align: center;
				line-height: 40rpx;
			}

			.title {
				font-size: 30rpx;
				font-weight: bold;
				color: #ff8b16;
				margin-top: 15rpx;
			}

			.info {
				font-size: 30rpx;
			}

			.btn {
				width: 220rpx;
				height: 80rpx;
				text-align: center;
				line-height: 80rpx;
				font-size: 30rpx;
				background: $globalGb;
				border-radius: 10rpx;
			}
		}
	}

	.header-wrap {
		height: 280rpx;
		padding: 0 40rpx;
		background-size: 100% 100%;
		padding-top: 45rpx;
		box-sizing: border-box;
		position: relative;
		.top {
			width: 128rpx;
			height: 128rpx;
			border: 2px solid white;
			overflow: hidden;
		}
		.gifimg {
			position: absolute;
			width: 100%;
			height: 100rpx;
			bottom: 0px;
		}
		.bottom {
			margin-top: 20rpx;

			.name {
				font-size: 34rpx;
			}
		}
	}

	.nav-wrap {
		height: 140rpx;
		width: 750rpx;
		top: 280rpx;
		background-color: #fff;
		.nav {
			flex: 1;
			flex-shrink: 0;
			position: relative;

			.icon {
				width: 45rpx;
				height: 45rpx;
			}

			.nav-num {
				font-size: 32rpx;
				font-weight: bold;
				color: #ff8d1a;
			}

			.nav-text {
				font-size: 24rpx;
				color: #000000;
				margin-top: 10rpx;
			}
		}
	}

	.list-wrap {
		left: 0;
		right: 0;
		top: 420rpx;
		border-bottom: 1rpx solid #d7dae2;
		margin-top: 16rpx;
		background-color: #fff;
		margin: 40rpx 20rpx;
		    border-radius: 20rpx;
		.tar-h {
			background: #f2f2f291;
			height: 16rpx;
		}

		.line {
			padding: 0 20rpx;
			height: 88rpx;

			&-boder-bottom {
				border-bottom: 1rpx solid #efefef;
			}

			.left {
				.icon {
					width: 44rpx;
					height: 44rpx;
					margin-right: 20rpx;
				}

				.name {
					font-size: 28rpx;
				}
			}

			.right {
				.right-info {
					display: inline-block;
					margin-right: 10rpx;
					font-size: 26rpx;
					color: #cccccc;
				}

				.show-icon {
					width: 30rpx;
					height: 30rpx;
				}
			}
		}
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
			-webkit-overflow-scrolling: touch;
			.contact-line {
				height: 100rpx;
				line-height: 100rpx;
				box-sizing: border-box;

				&:nth-child(1) {
					border-bottom: 2rpx solid #272a2f;
				}

				&:nth-child(2) {
					border-bottom: 6rpx solid #272a2f;
				}
			}
		}
	}
}

</style>
