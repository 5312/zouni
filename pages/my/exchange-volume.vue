<template>
	<view class="exchange-volume bg-page h100">
		<view class="ad-wrap">
			<image src="https://xm-img.gaoshilo.com/q2.jpg" mode="" class="h100 w100 ad-img"></image>
		</view>
		<view class="main">
			<view class="info-wrap">输入洗车券进行兑换</view>
			<view class="input-wrap">
				<input type="text" v-model="inputVal" class="input h100 w100" placeholder="请输入洗车卷号码"/>
			</view>
			<view class="btn-wrap">确认兑换</view>
		</view>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				inputVal:""
			}
		}
	}
</script>

<style scoped lang="less">
	.exchange-volume{
		.ad-wrap{
			height: 300rpx;
		}
		.main{
			.info-wrap{
				color: #999999;
				font-size: 26rpx;
				padding: 30rpx;
			}
			.input-wrap{
				background: #232730;
				height: 88rpx;
				.input{
					padding: 0 30rpx;
					border: none;
				}
			}
			.btn-wrap{
				color: #020202;
				background-color: #0af9b8;
				margin: 30rpx;
				width: 690rpx;
				text-align: center;
				height: 92rpx;
				line-height: 92rpx;
				border-radius: 10rpx;
				font-size: 36rpx;
			}
		}
	}
</style>
