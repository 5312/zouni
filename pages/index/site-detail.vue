<template>
	<view class="site-detail bg-page h100">
		<template v-if="detail">
			<view class="header flex flex flex-row a-center j-between">
				<view class="left">
					<image :src="detail.goods_image" mode="" class="w100 h100"></image>
				</view>
				<view class="right">
					<view class="title">{{detail.goods_name}}</view>
					<view class="address">{{detail.goods_df}}</view>
					<view class="other text-black">
						距离：<text class="distance">{{distance}}</text>
					</view>
				</view>
			</view>
			<view class="nav-wrap flex flex-row a-center j-center">
				<view class="nav" v-for="(item,index) in detail.serviceList" :key='index'>{{item}}</view>
			</view>
			<view class="info-wrap phone-wrap">站点状态：<text class="text-yellow">{{detail.goods_status.text}}</text></view>
			<view class="info-wrap">营业时间：<text>{{detail.goods_time}}</text></view>
			<view class="info-wrap">服务项目：{{detail.goods_xm}}</view>
			
			<view class="info-wrap phone-wrap">联系电话：<text  @click="call(detail.goods_tel)">{{detail.goods_tel}}</text></view>
			<view class="btn-wrap flex a-center flex-row j-between">
				<view :class="['btn',btnIndex===index?'btn-active':'']" v-for="(item,index) in btnList" :key='index' @click="openXm(item)">
					{{item.name}}
				</view>			
			</view>
			<view class="content" v-if="detail.content">
				<view class="title text-center ">- 洗车路线指引 -</view>
				<view class="main">
					<rich-text :nodes="detail.content"></rich-text>
				</view>
			</view>
			<view class="footer">
				<view class="title text-center ">- 温馨提示 -</view>
				<view class="des">
					停车场免费停车30分钟。为了避免洗车排队等待过久产生停车费，可通过点击【排队情况】提前查看，合理安排时间。
				</view>
			</view>
		</template>	
	</view>
</template>

<script>
	export default{
		data(){
			return{
				btnIndex:1,
				detailId:null,
				detail:null,
				distance:0,
				btnList:[
					{
						name:"排队情况",
						prop:"sort"
					},
					{
						name:"地图导航",
						prop:"map"
					},
				]
			}
		},
		onLoad(options){
			this.detailId=options.id
			this.init()
		},
		onShareAppMessage(res) {
		    if (res.from === 'button') {// 来自页面内分享按钮
		      console.log(res.target)
		    }
		    return {
		      title: '快来参加吧！',
		      path: `/pages/index/site-detail?id=${this.detailId}`
		    }
		 },
		methods:{
			init(){
				this.getListInfo()
			},
			getListInfo() {
				let addressInfo=this.$tool.uniGetStorage("addressInfo")
				this.$tool.uniRequest({
					url: `/api/goods/detail&goods_id=${this.detailId}`,
					params:{
						lat:addressInfo.lat,
						lng:addressInfo.lng
					},
					success: (res) => {
						this.detail = res && res.detail ? res.detail : null	
						this.distance = this.detail.goods_distance? this.$tool.distanceHanlde(this.detail.goods_distance) :0					
						if(this.detail && this.detail.content){
							this.detail.content=this.$tool.htmlre(this.detail.content)
							this.detail.content=this.$tool.formatRichText(this.detail.content)
						}
						
						if(this.detail.goods_tag){
							this.detail.serviceList=this.detail.goods_tag && this.detail.goods_tag.split("，")
							console.log(this.detail.serviceList)
						}
					}
				})
			},
			
			call(tel){
				uni.makePhoneCall({
				    phoneNumber: tel
				});
			},
			openXm(item){
				if(item.prop==='sort'){
					this.$tool.uniShowToast({
						title: "稍后开放！",
						icon: "none"
					})
					return
				}
				uni.openLocation({
				    latitude: parseFloat(this.detail.goods_lat),
				    longitude: parseFloat(this.detail.goods_lng),
					name: this.detail.goods_name,
				    success: function () {
				        console.log('success');
				    }
				});
				
			}
		}
	}
</script>

<style scoped lang="less">
	.site-detail{
		padding: 40rpx;
		.header{
			color: #999A9C;
			.left{
				width: 208rpx;
				height: 208rpx;
				margin-right: 30rpx;	
				flex-shrink: 0;
			}
			.right{
				flex: 1;
				.title{
					font-size: 38rpx;
					margin-bottom: 18rpx;
					color: black;
				}
				.address{
					font-size: 28rpx;
					margin-bottom: 20rpx;
				}
				.other{
					font-size: 20rpx;
					.distance{
						margin-right: 20rpx;
						display: inline-block;
					}
				}
			}
		}
		.nav-wrap{
			height: 86rpx;
			color: black;
			padding: 0 40rpx;
			border-bottom: 1rpx solid #F4F4F4;
			.nav{
				padding: 4rpx 20rpx;
				box-sizing: border-box;
				border-radius: 40rpx;
				font-size: 22rpx;
				border: 2rpx solid #FF8D1A;
				&:not(:last-child){
					margin-right: 30px;
				}
			}
		}
		.info-wrap{
			color: black;
			font-size: 24rpx;
			height: 40rpx;
			line-height: 40rpx;
		}
		.phone-wrap{
			margin-top: 14rpx;
			.phone {
				color: red;
			}
		}
		.btn-wrap{
			padding: 40rpx 0;
			.btn{
				text-align: center;
				height: 92rpx;
				line-height: 92rpx;
				border-radius: 46rpx;
				border: 2rpx solid #FF8D1A;
				width: 310rpx;
				color: #FF8D1A;
				font-weight: 900;
				&-active{
					background: #FF8D1A;
					color: #000;
				}
			}
		}
		.content{
			.title{
				height: 36rpx;
				line-height: 46rpx;
			}
			.main{
				font-weight: 100;
				font-size: 26rpx;
				margin: 40rpx 0;
				img {
					width: 370rpx !important;
				}
			}
		}
		.footer{
			.title{
				height: 36rpx;
				line-height: 46rpx;
			}
			.des{
				text-align: left;
				text-indent: 60rpx;
				font-size: 26rpx;
				padding: 20rpx 40rpx 40rpx 40rpx;
				color: #707175;
			}
		}
	}
</style>
