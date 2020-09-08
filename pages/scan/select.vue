<template>
	<view class="select-wrap">
		<view class="list-wrap" v-if="!isNoDate && list.length>0">
			<view class="box flex a-center j-start flex-row" v-for='(item,index) in list' :key='index' @click='selectBox(item)'
				:style="[getStyle(item)]">
				<view class="left">
					<view class="p">
						{{item.coupon_type.text}}
					</view>
					<view class="p1" v-if="item.name">{{item.name}}</view>
					<view class="p2">有效期：{{item.start_time.text}}至{{item.end_time.text}}</view>
				</view>
				<view class="right">
					<text class="text text1"></text>
					<text class="tar">{{item.coupon_type.value==10?`1次`:item.coupon_type.value==20?`￥${item.reduce_price}`:''}}</text>
					<text class="text text2"></text>
				</view>
			</view>
			<!-- <div class="box relative flex a-center flex-row j-between" v-for='(item,index) in list' :key='index' @click='selectBox(item)'>
				<div class="left">{{item.coupon_type.text}}</div>
				<div class="mid">
					<view class="p1">
						{{item.name}}
					</view>
					<view class="p2">
						有效期：{{item.start_time.text}}至{{item.end_time.text}}
					</view>
				</div>
				<div class="right flex a-center j-center">
					<image src="../../static/image/s-s1.png" class="select-img" v-if="userCouponId===item.user_coupon_id"></image>
				</div>
			</div> -->
		</view>
		<NoDate v-else></NoDate>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				list:[],
				isNoDate:false,
				userCouponId:0,
				siteId:null
			}
		},
		onLoad(options){
			console.log(options)
			this.userCouponId= options.userCouponId || 0
			this.siteId= options.siteId
			this.list = options.list?JSON.parse(options.list):[]
		},
		methods:{
			getStyle(item){
				let style={}
				style.backgroundColor=item.color.text
				return style
			},
			selectBox(item){
				this.userCouponId=item.user_coupon_id
				uni.reLaunch({
				    url:`/pages/scan/index?siteId=${this.siteId}&userCouponId=${this.userCouponId}&fromPage=select`
				})			
			}
		}
	}
</script>
<style lang="less" scoped>
.select-wrap{
	.list-wrap{
		.box{
			margin:30px 20px;
			padding: 0 30rpx;
			border-radius: 10rpx;
			height: 200rpx;
			.left{
				flex: 1;
				font-size: 28rpx;
				.p{
					font-weight: bold;
					font-size: 34rpx;
				}
				.p1,.p2{
					font-size: 26rpx;
				}
				.p1{
					margin: 10rpx 0;
				}
			}
			.right{
				position: relative;
				width: 160rpx;
				text-align: center;
				font-weight: 900;
				font-size: 40rpx;
				flex-shrink: 0;
				height: 100%;
				.text{
					display: inline-block;
					width: 50rpx;
					height: 50rpx;
					border-radius: 50%;
					background: white;
					left: 0;
					position: absolute;
				}
				.tar{
					border-left: 1px dashed white;
					display: inline-block;
					width: 100%;
					position: absolute;
					left: 25rpx;
					top: 40rpx;
					height: 126rpx;
					line-height: 126rpx;
				}
				.text1{
					top: -25rpx;
				}
				.text2{
					bottom: -25rpx;
				}
			}
		}
		// .box{
		// 	margin: 40rpx 40rpx 0 40rpx;
		// 	border-radius: 30rpx;
		// 	height: 180rpx;
		// 	background: url(../../static/image/car-bg.png) no-repeat;
		// 	background-size: 100% 100%;
		// 	.left{
		// 		width: 160rpx;
		// 		text-align: center;
		// 		height: 80rpx;
		// 		line-height: 80rpx;
		// 		font-weight: bold;
		// 		font-size: 40rpx;
		// 		flex-shrink: 0;
		// 	}
		// 	.mid{
		// 		font-size: 27rpx;
		// 		flex: 1;
		// 	}
		// 	.right{
		// 		width: 80rpx;
		// 		flex-shrink: 0;
		// 		padding-right: 4rpx;
		// 		.select-img{
		// 			width: 44rpx;
		// 			height: 44rpx;
		// 		}
		// 	}
		// }
	}
}
</style>
