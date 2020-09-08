<template>
	<view class="order-detail h100" v-if="detail">
		<view class="order-status flex a-center j-center flex-column text-yellow">
			<image src="../../static/image/pay_ok.png" class="img"></image>
			<text>{{detail.state_text}}</text>
		</view>
		<view class="content">
			<view class="title text-center">订单详情</view>
			<view class="list">
				<view class="line flex a-center j-between flex-row">
					<text class="label">车牌号码</text>
					<text class="item">{{detail.goods[0].goods_car}}</text>
				</view>
				<view class="line flex a-center j-between flex-row">
					<text class="label">订单编号</text>
					<text class="item">{{detail.order_no}}</text>
				</view>
				<view class="line flex a-center j-between flex-row">
					<text class="label">订单时间</text>
					<text class="item">{{detail.create_time}}</text>
				</view>
				<view class="line flex a-center j-between flex-row">
					<text class="label">服务站点</text>
					<text class="item">{{detail.goods[0].goods_name}}</text>
				</view>
				<view class="line flex a-center j-between flex-row">
					<text class="label">支付方式</text>
					<text class="item">{{detail.pay_type.text}}</text>
				</view>
				<view class="line flex a-center j-between flex-row">
					<text class="label">优惠金额</text>
					<text class="item">￥{{detail.coupon_money}}</text>
				</view>
				<view class="line flex a-center j-between flex-row">
					<text class="label">实付金额</text>
					<text class="item">￥{{detail.pay_price}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				detail:null
			}
		},
		onLoad(options){
			let id=options.id
			this.getDetail(id)
		},
		methods:{
			getDetail(id){
				this.$tool.uniRequest({
					url: `/api/user.order/detail&order_id=${id}`,
					success: (res) => {
						this.detail=res.order
					}
				})
			}
		}
	}
</script>

<style scoped lang="less">
.order-detail{
	.order-status{
		height: 270rpx;
		font-size: 60rpx;
		font-weight: bold;
		.img {
			width: 150rpx;
			height: 150rpx;
		}
	}
	.content {
		margin-top: 20rpx;
		.title {
			margin-bottom: 40rpx;
			height: 80rpx;
			line-height: 80rpx;
		}
		.list {
			padding: 0 40rpx;
			.line {
				height: 68rpx;
				line-height: 80rpx;
				.label {
					color: #8E8F94;
				}
				.item {

				}
			}
		}
	}
}
</style>
