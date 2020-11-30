<template>
	<view class="site bg-page h100">
		<view class="content">
			<view class='cu-progress xs striped animation-reverse' :class="{'animation-slide-top':width == 100}">
				<view class="bg-orange" :style="{width:width+'%'}"></view>
			</view>
			<u-empty text="正在加载..." mode="list" v-show="!empty"></u-empty>
			<view
				v-show="empty"
				v-for="(item, index) in cardList"
				:key="index"
				class="card flex shadow a-center j-between flex-row"
				:class="[item.animation?toggleDelay?'animation-slide-bottom':'':'']"
				:style="[{animationDelay: (index + 1)*0.1 + 's'}]"
				@click="toPage(item)"
				hover-class="active bg-list"
			>
				<image :src="item.goods_image" class="left"></image>
				<view class="mid">
					<view class="title nowrap">{{ item.goods_name }}</view>
					<view class="address">{{ item.goods_df }}</view>
					<view class="other flex flex-row a-center j-start">
						<view class="distance flex flex-row a-center j-start">
							<image src="../../static/image/l-c1.png" class="img"></image>
							<text>{{ $tool.distanceHanlde(item.goods_distance) }}</text>
						</view>
						<view class="flex flex-row a-center j-start text-xs">
							<view class="cuIcon-timefill text-orange img"></view>
							<text>{{ item.goods_time }}</text>
						</view>
					</view>
				</view>
				<view class="right" :class="[item.goods_status.text === '正常营业' ? 'text-yellow' : 'text-black']">{{ item.goods_status.text }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	
export default {
	data() {
		return {
			width:0,//进度条
			interval:null,//定时器
			toggleDelay: false,//动画
			animation:true,//动画开关
			scoped:10,
			page: 1,
			total: 0,
			category_id: 1,
			empty: false,
			addressInfo: null,
			coupon_id: null,
			isReachStar: 0, //数组截取star位置
			isReachEnd: 10, //数组截取结束位置
			arr: [],
			goodslist: true
		};
	},
	onLoad(options) {
		this.coupon_id = options.coupon_id || null;
		///控制进度条
		this.interval = setInterval(()=>{
			this.width += this.scoped;
			if(!this.cardList){
				if(this.width>=90) this.width = 90;
			}else{
				this.width = 100;
			}
			if(this.width>=100){
				console.log('清除')
				clearInterval(this.interval);				
			}
		},500)
	},
	onPullDownRefresh() {
		//下拉刷新
	},
	onReachBottom() {
		this.addressInfo = this.$cache.get('_addressInfo');
		if (this.addressInfo.category_id || this.coupon_id) return; //*不触发触底加载*//
		//触底加载
		this.animation = false;//关闭动画
		if (this.isReachEnd > this.total) {
			return false;
		} else {
			this.isReachStar += 10;
			this.isReachEnd += 10;
		}
	},
	computed: {
		cardList (e) {
			/* eslint-disable */
			this.addressInfo = this.$cache.get('_addressInfo');
			if (this.addressInfo.category_id || this.coupon_id) {
				//**全站点**//
				if (!this.goodslist) return this.arr;
				this.goodsList();
				this.goodslist = false;
				return this.arr;
			} else {
				/*次卡页面*/
				if (this.$store.state.site != null) {
					let list = this.$store.state.site; //从vuex stroe中取值
					this.total = list.length; //分页判断
					this.isPullDown = false;
					uni.stopPullDownRefresh(); //停止页面下拉刷新
					//10个为一组
					let child = list.slice(this.isReachStar, this.isReachEnd);
					this.arr.push(...child);
					
					if(this.animation){//触底后关闭动画
						//给前十个加动画
						this.arr.forEach((x,y)=>{
							if(y<= 10){
								x.animation = true;
							}
						});
						this.toggleDelay= true;
						setTimeout(()=>{
							this.toggleDelay= false
						}, 1000)
					}
					//当数据出现时；
					this.empty = true; //数据为空的提示
					return this.arr;
				}
			}
		}
	},
	methods: {
		init() {},
		async goodsList() {
			this.arr = []; //切换到次卡页面时
			this.empty = false; ///
			const result = await this.$api.index_siteGoodsList({
				page: this.page,
				search: '',
				coupon_id: this.coupon_id || '',
				category_id: this.coupon_id ? '' : category_id,
				lat: String(this.addressInfo.lat),
				lng: String(this.addressInfo.lng)
			});
			let res = result.data;
			this.total = res.pages.total;
			this.isPullDown = false;
			this.empty = true; //数据为空的提示
			this.arr = res.posiList;
		},
		toPage(item) {
			this.$tool.uniNavigateTo({
				url: `/pages/index/site-detail?id=${item.goods_id}`
			});
		}
	}
};
</script>

<style scoped lang="scss">
@import "../../colorui/animation.css";
.site {
	.ad-wrap {
		height: 176rpx;
		.img {
			border-radius: 4rpx;
		}
	}
	.content {
		.card {
			height: 204rpx;
			padding: 0 20rpx;
			position: relative;
			&::after {
				position: absolute;
				top: 0;
				left: 0;
				box-sizing: border-box;
				width: 200%;
				height: 200%;
				border-bottom: 1rpx solid #ddd;
				border-radius: inherit;
				content: ' ';
				transform: scale(0.5);
				transform-origin: 0 0;
				pointer-events: none;
			}

			.left {
				width: 150rpx;
				height: 150rpx;
				flex-shrink: 0;
				border-radius: 6rpx;
			}
			.mid {
				width: 55%;
				padding: 0 30rpx;
				.title {
					color: black;
					font-size: 32rpx;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.address {
					color: #97989a;
					font-size: 23rpx;
					overflow: hidden;
					line-height: 30rpx;
					margin: 10rpx 0;
				}
				.other {
					color: #5f6366;
					font-size: 23rpx;
					.img {
						width: 24rpx;
						height: 24rpx;
						margin-right: 6rpx;
					}
					.distance {
						display: inline-block;
						margin-right: 40rpx;
					}
				}
			}
			.right {
				width: 25%;
				font-size: 30rpx;
				text-align: right;
			}
		}
	}
}
</style>
