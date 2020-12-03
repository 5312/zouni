<template>
	<view class="wrap">
		<view class="topImg bg-gradual-orange"><image class="gif-black gifbg" src="../../static/image/loading-black.gif" mode="scaleToFill"></image>
			<text class="text-xxl text-white title">-洗车券核销中心-</text>
		</view>
		<view class="from">
			<view class="text-df text-gray text">输入洗车卷号进行核销</view>
			<u-input :custom-style='style'  :border="true" placeholder="请输入洗车卷号" :focus='true' type="text" v-model="number"  @click='show = true' />
			<u-keyboard ref="uKeyboard" :tooltip='false' mode="number"  @backspace="backspace" @change="change" v-model="show" :mask="false"></u-keyboard>
		</view>
		<view class="btn"><u-button type="warning" @click="submit">确认核销</u-button></view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			show: false,
			number: '',
			style:{
				'padding':'',
			}
		};
	},
	onReady() {
		this.show = true;
	},
	methods: {
		change(e) {
			this.number += e;
		},
		// 退格键被点击
		backspace() {
			// 删除value的最后一个字符
			if (this.number.length) this.number = this.number.substr(0, this.number.length - 1);
		},
		async submit(){
			const result =await this.$api.baseWriteOff({
				
			}).catch(err => {
				console.log(err)
			});
			
		}
	}
};
</script>

<style lang="scss" scoped>
page {
	.wrap {
		.topImg {
			width: 100%;
			height: 440rpx;
			overflow: hidden;
			position: relative;
			.gifbg {
				position: absolute;
				bottom:0;
				left:0;
				right:0;
				margin:auto;
			}
			.title{
				position: absolute;
				width:80%;
				height:40rpx;
				text-align: center;
				top:0;
				bottom:0;
				left:0;
				right:0;
				margin:auto;
				z-index:2;
			}
		}
		.from {
			.text{
				padding:30rpx 20rpx;
			}
		}
		.btn {
			width: 95%;
			padding:20rpx;
			text-align: center;
			margin: auto;
		}
	}
}
</style>
