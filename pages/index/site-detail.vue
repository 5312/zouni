<template>
	<view class="site-detail bg-page h100">
		<template v-if="detail">
			<view class="header flex flex flex-row a-center j-between">
				<view class="left "><image :src="detail.goods_image" mode="" class=" w100 h100"></image></view>
				<view class="right">
					<view class="title text-black text-bold">{{ detail.goods_name }}</view>
					<view class="address">{{ detail.goods_df }}</view>
					<view class="other text-gray text-df">
						距离：
						<text class="ext-red">{{ distance }}</text>
					</view>
				</view>
			</view>
			<view class="nav-wrap flex flex-row a-center j-start">
				<view class="leftBox"></view>
				<view 
					class="cu-capsule round" 
					v-for="(item, index) in detail.serviceList" 
					:key="index">
					<view class="cu-tag bg-orange">
						<text class="cuIcon-evaluate"></text>
					</view>
					<view class="cu-tag line-orange">{{ item }}</view>
				</view>
			</view>
			<view class="info-wrap phone-wrap">
				站点状态：
				<text class="text-yellow">{{ detail.goods_status.text }}</text>
			</view>
			<view class="info-wrap">
				营业时间：
				<text>{{ detail.goods_time }}</text>
			</view>
			<view class="info-wrap">服务项目：{{ detail.goods_xm }}</view>

			<view class="info-wrap phone-wrap">
				联系电话：
				<text @click="call(detail.goods_tel)">{{ detail.goods_tel }}</text>
			</view>
			<view class="btn-wrap flex a-center flex-row j-between">
				<!-- <view :class="['btn', btnIndex === index ? 'btn-active' : '']" hover-class="active" v-for="(item, index) in btnList" :key="index" @click="openXm(item)">
					{{ item.name }}
				</view> -->
				<button 
					hover-class="active"
					class="cu-btn round shadow btn"
					:class="[ btnIndex === index ? 'bg-orange' : 'lines-orange']" 
					v-for="(item, index) in btnList" 
					:key="index" 
					@click="openXm(item)">
					{{ item.name }}
				</button>
			</view>
			<view class="content" v-if="detail.content">
				<view class="title text-center ">- 洗车路线指引 -</view>
				<view class="main"><rich-text :nodes="detail.content"></rich-text></view>
			</view>
			<view class="footer">
				<view class="title text-center ">- 温馨提示 -</view>
				<view class="des">停车场免费停车30分钟。为了避免洗车排队等待过久产生停车费，可通过点击【排队情况】提前查看，合理安排时间。</view>
			</view>
			<Queue
				class="queue"
				:show="queue"
				@closeQueue="closeQueue"
				:name="detail.goods_name"
				:goods_id="detail.goods_id"
				:csn="detail.goods_csn"
				:tag="detail.goods_tag"
			></Queue>
		</template>
	</view>
</template>

<script>
import Queue from '../../components/queue/queue.vue';
export default {
	components: {
		Queue
	},
	data() {
		return {
			queue: false, //视频组件
			btnIndex: 1,
			detailId: null,
			detail: null,
			distance: 0,
			btnList: [
				{
					name: '排队情况',
					prop: 'sort'
				},
				{
					name: '地图导航',
					prop: 'map'
				}
			]
		};
	},
	onLoad(options) {
		this.detailId = options.id;
		this.init();
	},
	onShareAppMessage(res) {
		if (res.from === 'button') {
			// 来自页面内分享按钮
			console.log(res.target);
		}
		return {
			title: '快来参加吧！',
			path: `/pages/index/site-detail?id=${this.detailId}`
		};
	},
	methods: {
		init() {
			this.getListInfo();
		},
		async getListInfo() {
			let addressInfo = this.$cache.get('_addressInfo');
			const result =await this.$api.index_siteDetail({
				goods_id: this.detailId,
				lat: addressInfo.lat,
				lng: addressInfo.lng
			}).catch(err => {
				uni.navigateBack({
					delta: 1
				});
				this.$tool.uniShowToast({
					title: '敬请期待！',
					icon: 'none'
				});
			});
			if (!result) return;
			let res = result.data;
			this.detail = res.detail || null;
			this.distance = this.detail.goods_distance ? this.$tool.distanceHanlde(this.detail.goods_distance) : 0;
			if (this.detail && this.detail.content) {
				this.detail.content = this.$tool.htmlre(this.detail.content);
				this.detail.content = this.$tool.formatRichText(this.detail.content);
			}
			if (this.detail.goods_tag) {
				this.detail.serviceList = this.detail.goods_tag && this.detail.goods_tag.split('，');
			}
		},

		call(tel) {
			uni.makePhoneCall({
				phoneNumber: tel
			});
		},
		closeQueue() {
			this.queue = false;
		},
		openXm(item) {
			if (item.prop === 'sort') {
				this.queue = true;
				let qThis = this;
				return;
			}
			uni.openLocation({
				latitude: parseFloat(this.detail.goods_lat),
				longitude: parseFloat(this.detail.goods_lng),
				name: this.detail.goods_name,
				address: this.detail.goods_df, //详细地址
				success: function() {
					console.log('success');
				}
			});
		}
	}
};
</script>

<style scoped lang="less">
.site-detail {
	padding: 40rpx;
	.header {
		color: #999a9c;
		.left {
			width: 208rpx;
			height: 208rpx;
			margin-right: 30rpx;
			flex-shrink: 0;
			border-radius: 10rpx;
			image{
				border-radius: 10rpx;
			}
		}
		.right {
			flex: 1;
			.title {
				font-size: 38rpx;
				margin-bottom: 18rpx;
			}
			.address {
				font-size: 28rpx;
				margin-bottom: 20rpx;
			}
			.other {
				.distance {
					margin-right: 20rpx;
					display: inline-block;
				}
			}
		}
	}
	.nav-wrap {
		height: 86rpx;
		color: black;
		border-bottom: 1rpx solid #f4f4f4;
		.leftBox{
			width: 208rpx;
			margin-right: 30rpx;
		}
		.nav {
			padding: 4rpx 20rpx;
			box-sizing: border-box;
			border-radius: 40rpx;
			font-size: 22rpx;
			border: 2rpx solid #ff8d1a;
			&:not(:last-child) {
				margin-right: 30px;
			}
		}
	}
	.info-wrap {
		color: black;
		font-size: 24rpx;
		height: 40rpx;
		line-height: 40rpx;
	}
	.phone-wrap {
		margin-top: 14rpx;
		.phone {
			color: red;
		}
	}
	.btn-wrap {
		padding: 40rpx 0;
		.btn {
			text-align: center;
			height: 92rpx;
			line-height: 92rpx;
			width: 310rpx;
			font-weight: 900;
		}
	}
	.content {
		.title {
			height: 36rpx;
			line-height: 46rpx;
		}
		.main {
			font-weight: 100;
			font-size: 26rpx;
			margin: 40rpx 0;
			img {
				width: 370rpx !important;
			}
		}
	}
	.footer {
		.title {
			height: 36rpx;
			line-height: 46rpx;
		}
		.des {
			text-align: left;
			text-indent: 60rpx;
			font-size: 26rpx;
			padding: 20rpx 40rpx 40rpx 40rpx;
			color: #707175;
		}
	}
}
</style>
