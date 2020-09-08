<template>
	<view class="no-data flex a-center flex-row j-center">
		<view class="left"></view>
		<view class="mid">{{title}}</view>
		<view class="right"></view>
	</view>
</template>

<script>
	export default {
		props: {
			title: {
				type: String,
				default: "暂无数据"
			}
		}
	}
</script>

<style scoped lang="less">
	.no-data {
		color: #C0C0C0;
		padding-top: 60rpx;

		.left,
		.right {
			width: 160rpx;
			height: 2rpx;
			background: #C0C0C0;
		}

		.mid {
			margin: 0 20rpx;
		}
	}
</style>
