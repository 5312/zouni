<template>
	<view class="wrap" >
		<view class="topImg bg-gradual-orange"><image class="gif-black gifbg" src="../../static/image/loading-black.gif" mode="scaleToFill"></image>
			<text class="text-xxl text-white title">-洗车券兑换中心-</text>
		</view>
		<view class="from">
			<view class="text-df text-gray text"></view>
			<view class="input">
				<u-input 
					:custom-style='style'  
					:border="true" 
					placeholder="请输入卡密" 
					:focus='true' 
					type="text" 
					v-model="number"  
					@click='show = true' 
					:mask-close-able='false' />
			</view>
			<!-- <u-keyboard ref="uKeyboard" :tooltip='false' mode="number"  @backspace="backspace" @change="change" v-model="show" :mask="false"></u-keyboard> -->
		</view>
		<u-modal v-model="modal" :content="content" :show-title='false' confirm-text='立即查看' @confirm="confirm"></u-modal>
		<view class="btn"><u-button type="warning" @click="submit">确认兑换</u-button></view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			show: false,
			modal:false,
			content:null,
			number: '',
			style:{
				'padding':'20rpx',
				'fontSize':'30rpx',

			}
		};
	},
	onReady() {
		this.show = true;
	},
	methods: {
		change(e) {
			if(this.number.length >= 6){
				return ;
			}
			this.number += e;
		},
		// 退格键被点击
		backspace() {
			// 删除value的最后一个字符
			if (this.number.length) this.number = this.number.substr(0, this.number.length - 1);
		},	
		async submit(){
			const result =await this.$api.baseWriteOff({
				"code":this.number,
			}).catch(err => {
				this.$tool.uniShowToast({
					title:err,
					icon:'none'
				})
			});
			if(!result) return;
			this.content = `恭喜你，有${result.data}张次卡已存入卡包！`;
			this.modal = true;
		},
		confirm(){
			this.$tool.uniRedirectTo({
				url:`/pages/my/volume`
			})
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
			.input{
				width:90%;
				margin:auto;
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
