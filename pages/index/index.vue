<template>
	<view :class="['index fixed p-tblr', !isAuthAddress && isShowAuthLogin ? 'bg-page' : '']">
		<template v-if="isAuthAddress">
			<view class="header absolute flex j-between a-center flex-row bg-white">
				<view class="left" hover-class="active" @click="toPage('address')">
					<template v-if="addressInfo">
						<text class="address">{{ addressInfo.name ? addressInfo.name : '' }}</text>
						<image src="../../static/image/more1.png" mode="" class="more_icon"></image>
					</template>
				</view>
				<view class="right">
					<template v-if="weatherInfo">
						<text>{{ weatherInfo.wea }}</text>
						<text class="margin-lr">{{ weatherInfo.tem }} °C</text>
						<text>{{ weatherInfo.air_level }}</text>
					</template>
				</view>
			</view>
			<!-- map  -->
			<view class="main absolute ">
				<map
					class="w100 h100"
					id="myMap"
					:latitude="latitude"
					:longitude="longitude"
					show-location
					:scale="mapScale"
					:markers="covers"
					@regionchange="regionchange"
					@markertap="markertap"
					@tap="tap"
				/>
			</view>
			<!-- mark 提示 v-if="markDetail"-->
			<view :class="{ bottommShow: bottom, bottommHide: !bottom }" class="markDetail shadow-warp" @click="getSiteDetail">
				<view class="left ">
					<view class="text">
						<view class="titles text-cut">{{ markDetail.goods_name }}</view>
					</view>
					<view class="img cuIcon-timefill text-orange"></view>
					<text class="tag">{{ markDetail.goods_time }}</text>
				</view>
				<view class="right text-xxl box flex a-center j-center flex-column" @click.stop.prevent="open">
					<view class="cuIcon-locationfill text-orange"></view>
					<text class="text-sm">{{ distance }}</text>
				</view>
				<view class="right text-xxl box flex a-center j-center flex-column" @click.stop.prevent="queueFunc">
					<view class="cuIcon-recordfill text-orange"></view>
					<text class="text-sm">排队视频</text>
				</view>
			</view>
			<view class="footer absolute flex j-between a-center flex-row bg-white">
				<view class="left  flex a-center j-center flex-column" hover-class="active" @click="toPage('vip')">
					<image src="../../static/image/03.png" mode="" class="img"></image>
					<text>卡包</text>
				</view>
				<button class="cu-btn bg-orange mid  bold shadow round text-xxl text-black" role="button" aria-disabled="false" @click="scanCode">
					<text class="cuIcon-scan margin-right-xs"></text>
					扫码洗车
				</button>
				<view class="right  flex a-center j-center flex-column" hover-class="active" @click="toPage('my')">
					<image src="../../static/image/02.png" mode="" class="img"></image>
					<text>我的</text>
				</view>
			</view>
			<view class="list-wrap shadow-wrap fixed bg-white" :class="{ sliderHide: !list, sliderShow: list }">
				<view class="box text-sl flex a-center j-center flex-column" hover-class="active" @click="toPage('site')">
					<view class="cuIcon-sort text-orange "></view>
					<text class="text-sm">站点列表</text>
				</view>
				<view class="box text-sl flex a-center j-center flex-column" hover-class="active" @click="addressHandle">
					<view class="cuIcon-focus text-orange "></view>

					<text class="text-sm">定位</text>
				</view>
				<view class="box text-sl flex a-center j-center flex-column" hover-class="active" @click="isContact = true">
					<view class="cuIcon-servicefill text-orange "></view>
					<text class="text-sm">客服</text>
				</view>
			</view>
			<view class="activity-wrap fixed" hover-class="active" v-if="adImg" @click="toAdPage"><image :src="adImg" class="w100" mode="widthFix"></image></view>
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
		<AuthLogin v-if="!isAuthAddress && isShowAuthLogin" @loginOk="loginOk" :status="'userLocation'"></AuthLogin>
		<Queue
			class="queue"
			:show="queue"
			@closeQueue="closeQueue"
			:name="markDetail.goods_name"
			:goods_id="markDetail.goods_id"
			:csn="markDetail.goods_csn"
			:tag="markDetail.goods_tag"
		></Queue>
	</view>
</template>

<script>
import AuthLogin from '../../components/base/auth-login.vue';
import Queue from '../../components/queue/queue.vue';
import { mapActions } from 'vuex';
export default {
	components: {
		AuthLogin,
		Queue
	},
	data() {
		return {
			list: true, //右侧
			bottom: false, //底部
			queue: false, //视频组件
			adImg: '',
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
			distance: 0
		};
	},
	onShareAppMessage(res) {
		if (res.from === 'button') {
			// 来自页面内分享按钮
		}
		let userId = this.$cache.get('_userId');
		return {
			title: '快来参加吧！',
			path: `/pages/index/index?referrerId=${userId}`
		};
	},
	onLoad(options) {
		this.fromPage = options && options.fromPage ? options.fromPage : null;
		if (this.fromPage && this.fromPage === 'address') {
			this.addressInfo = JSON.parse(options.addressInfo);
			this.latitude = this.addressInfo.lat;
			this.longitude = this.addressInfo.lng;
			this.$cache.set('_addressInfo', this.addressInfo);
		}
		if (options.referrerId) {
			this.$cache.set('_referrerId', options.referrerId); //推荐人id
		}
	},
	onReady() {
		this.init();
		this.findsiteUpdata(); //检测站点更新
	},
	methods: {
		...mapActions([
			//映射actions
			'setSite'
		]),
		queueFunc() {
			this.queue = true; //显示视频弹窗
			this.list = false; //收回右侧
			this.bottom = false; //收回底部
		},
		closeQueue() {
			//关闭视频弹窗
			this.queue = false;
			this.list = true;
			this.bottom = true; //显示底部
		},
		tap(e) {
			//点击地图
			//this.bottom = false; //显示clss动画
		},
		init(isReset = false) {
			this.$tool.isGetLocation(
				'scope.userLocation',
				() => {
					this.isAuthAddress = true;
					this.isShowAuthLogin = false;
					if (this.fromPage && this.fromPage === 'address' && !isReset) {
						this.mapScale = 11;
						this.getWeather();
						this.getPthone();
						this.getListInfo();
					} else {
						this.mapScale = 16;
						this.getLocationInfo();
					}
					this.getAdInfo(); //广告
				},
				() => {
					this.isAuthAddress = false;
					this.isShowAuthLogin = true;
				}
			);
		},
		loginOk() {
			this.init();
		},
		async addressHandle() {
			//点击定位
			this.mapScale = 16;
			const loca = await this.getLocationInfo(true);
		},
		async getPthone() {
			const res = await this.$api.index_Tel();
			this.phone = res.data.tel;
		},
		getPhoneNumber(e) {},
		markertap(e) {
			let markerId = e.detail.markerId;
			let result = null;
			this.covers.forEach((item, index) => {
				item.iconPath = '../../static/image/maplocation.png'; //重置其他图标
				if (item.id == markerId) {
					result = item; //
					this.markColor(item, index); //改变点击颜色
				}
			});
			try {
				//重复点击判断
				if (result.goods_id == this.markDetail.goods_id) {
					return;
				}
				result && this.getInfo(result.goods_id);
			} catch (e) {
				result && this.getInfo(result.goods_id);
			}
		},
		markColor(item, index) {
			//标注变色
			item.iconPath = '../../static/image/maplocation-on.png';
		},
		async getInfo(detailId) {
			let addressInfo = this.$cache.get('_addressInfo');
			const detail = await this.$api.index_goodsDetail({
				goods_id: detailId,
				lat: addressInfo.lat,
				lng: addressInfo.lng
			});
			if (detail.msg == 'Undefined index: result') {
				this.markDetail = null;
				setTimeout(() => {
					this.$tool.uniShowToast({
						title: '即将开业！',
						icon: 'none'
					});
				}, 400);
			} else {
				this.markDetail = detail.data.detail;
				this.bottom = true; //显示clss动画
				let distance = detail.data.detail.goods_distance;
				this.distance = distance ? this.$tool.distanceHanlde(distance) : 0;
			}
		},
		regionchange(e) {},
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
			});
		},
		toAdPage() {
			this.$tool.uniNavigateTo({
				url: `/pages/my/card`
			});
		},
		async findsiteUpdata() {
			const getConts = await this.$api.index_getConts({
				wxapp_id: '10001'
			});
			if (getConts) {
				const cover = this.$cache.get('_covers'); //缓存标记
				if (!cover) {
					return;
				}
				const len = cover.length;
				if (getConts.data.cont != len) {
					this.$cache.delete('_covers'); //清空缓存
					this.getListInfo();
				}
			}
		},
		async getLocationInfo(addHandle = null) {
			let _this = this;
			this.mapCtx = uni.createMapContext('myMap');
			/* 获取位置信息 */
			const location = await uni.getLocation({
				//获取位置信息
				type: 'wgs84',
				geocode: true
			});
			/* 返回 [null,{}] */
			if (!location[1]) return;
			let res = location[1]; ///
			this.latitude = res.latitude; //纬度
			this.longitude = res.longitude; //经度
			/* 请求城市列表 */
			const city = await this.$api.index_cityList({
				lat: res.latitude,
				lng: res.longitude
			});
			let result = city.data;
			console.log('城市', result);
			let cityName = result.geocoder.city;
			if (cityName.charAt(cityName.length - 1) === '市') {
				cityName = cityName.substr(0, cityName.length - 1);
			}
			this.addressInfo = {
				name: cityName,
				lat: this.latitude,
				lng: this.longitude,
				category_id: ''
			};
			this.mapCtx.moveToLocation(); //地图中心点切换到当前位置
			this.$cache.set('_addressInfo', this.addressInfo);
			if (!addHandle) {
				this.getWeather();
				this.getListInfo();
				this.getPthone();
			}
			this.setSite({
				//vuex的mapActive方法
				latitude: this.latitude,
				longitude: this.longitude
			});
		},
		async getAdInfo() {
			//首页广告
			const ad = await this.$api.index_ad();
			this.adImg = ad.data.indexAd;
		},
		async getWeather() {
			//天气情况
			const res = await this.$api.index_weather({
				lat: this.addressInfo.lat,
				lng: this.addressInfo.lng,
				city: this.addressInfo.name
			});
			this.weatherInfo = res;
		},
		async getListInfo() {
			const cover = this.$cache.get('_covers'); //缓存标记
			if (cover) {
				this.covers = cover;
				return;
			}
			const result = await this.$api.index_mapCover();
			let res = result.data;
			let temObj = res && res.posiList && res.posiList.data ? res.posiList.data : [];
			this.covers = [];
			for (let i in temObj) {
				let obj = {
					id: i + 1,
					width: '50rpx',
					height: '63rpx',
					goods_id: temObj[i].goods_id,
					latitude: temObj[i].goods_lat,
					longitude: temObj[i].goods_lng,
					iconPath: '../../static/image/maplocation.png'
				};
				this.covers.push(obj);
			}
			this.$cache.set('_covers', this.covers);
		},
		scanCode() {
			//优化
			const scan = new Promise(function(resolve, reject) {
				uni.scanCode({
					success: resolve
				});
			});
			scan.then(res => {
				//已优化
				let result = res.result;
				let params = this.$tool.getUrlParams(result);
				let type = params.siteId ? 'site' : 'userSharing';
				const PATH = {
					site: `/pages/scan/index?siteId=${params.siteId}&fromPage=home`, //站点扫码
					userSharing: `/pages/my/card-detail?uid=${params.uid}&id=${params.tid}` //用户分享二维码
				};
				this.$tool.uniRedirectTo({
					url: PATH[type]
				});
			});
		},
		online() {
			this.$tool.uniShowToast({
				title: '稍后开放！',
				icon: 'none'
			});
		},
		toPage(type) {
			const pagesUrl = {
				my: '/pages/my/index',
				vip: '/pages/my/volume',
				address: `/pages/address/index?addressName=${this.addressInfo.name}`,
				site: '/pages/index/site'
			};
			let url = pagesUrl[type] || '/pages/index/index';
			this.$tool.uniNavigateTo({
				url
			});
		},
		call() {
			uni.makePhoneCall({
				phoneNumber: this.phone
			});
		},
		close() {
			this.isContact = false;
		}
	}
};
</script>

<style lang="scss" scoped>
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
		width: 85%;
		height: 120rpx;
		bottom: 140rpx;
		left: 0;
		right: 0;
		margin: auto;
		border-radius: 20rpx;
		background-color: #fff;
		padding: 10rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 30rpx;

		.left {
			text-align: left;
			white-space: nowrap;
			// icon 
			.img{
				display: inline-block;
			}
			.titles {
				width: 313rpx;
				display: inline-block;
				padding:10rpx 0 ;
				vertical-align: middle;
			}

			text {
				margin: 10rpx 0;
			}

			.status {
				padding: 5rpx;
				background: #ff893a;
				border-radius: 10rpx;
				margin: 0rpx 0 0 10rpx;
				vertical-align: middle;
			}

			.tag {
				border-radius: 20rpx;
				padding: 0 20rpx;
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
		height: 100rpx;
		padding: 0 100rpx;
		box-shadow: 0 0rpx 10rpx rgba(0, 0, 0, 0.2);
		.mid {
			width: 320rpx;
			height: 100rpx;
			position: relative;
			top: -35rpx;
			z-index: 9;
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

		.right {
		}
	}

	.list-wrap {
		color: black;
		padding:10rpx;
		right: 40rpx;
		bottom: 450rpx;
		border-radius: 20rpx;
		font-size: 12rpx;

		.box {
			height: 150rpx;
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
					border-bottom: 2rpx solid #272a2f;
				}

				&:nth-child(2) {
					border-bottom: 10rpx solid #272a2f;
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
@mixin classPulic($name, $status: shows) {
	@if $status==shows {
		.#{$name}Show {
			animation: #{$name}-show 0.5s ease-in both;
		}
	} @else {
		.#{$name}Hide {
			animation: #{$name}-hide 0.5s ease-in both;
		}
	}
}

@include classPulic(slider, hides) @include classPulic(slider, shows) @include classPulic(bottomm, shows) @include classPulic(bottomm, hides) @keyframes slider-hide {
	from {
		right: 40rpx;
	}

	to {
		right: -295rpx;
	}
}
@keyframes slider-show {
	from {
		right: -295rpx;
	}

	to {
		right: 40rpx;
	}
}
@keyframes bottomm-show {
	from {
		bottom: -140rpx;
	}

	to {
		bottom: 140rpx;
	}
}
@keyframes bottomm-hide {
	from {
		bottom: 140rpx;
	}

	to {
		bottom: -140rpx;
	}
}
</style>
