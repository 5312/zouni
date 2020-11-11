<template>
	<view class="wrap">
		<view class="body">
			<view class="showStatus flelx a-center j-between" :style="{color:color}">{{ showStatus }}</view>
			<view class="text">
				<u-button :ripple="true" :custom-style="customStyle" :disabled='disabled' @click="stop" size="medium" type="warning"
				 :loading='load'>{{ buttonText }}</u-button>
				<view class="image">
					<image class="circle " :class="{ c1:active }" src="../../../static/bg-gif/top1.png" mode=""></image>
					<image class="circle " :class="{ c2:active }" src="../../../static/bg-gif/top2.png" mode=""></image>
					<image class="circle " :class="{ c3:active }" src="../../../static/bg-gif/top3.png" mode=""></image>
					<image class="circle " :class="{ c4:active }" src="../../../static/bg-gif/top4.png" mode=""></image>
					<image class="circle " :class="{ c5:active }" src="../../../static/bg-gif/top5.png" mode=""></image>
					<image class="circle " :class="{ c6:active }" src="../../../static/bg-gif/top6.png" mode=""></image>
					<image class="circle " :class="{ c7:active }" src="../../../static/bg-gif/top7.png" mode=""></image>
					<image class="circle " :class="{ c8:active }" src="../../../static/bg-gif/top8.png" mode=""></image>
				</view>
			</view>

			<view class="tishi">
				{{ tishi }}
			</view>
			<view class="kefu" v-if="type == 2">
				<text>客服电话-</text><text class="kefu_b" @click.stop.prevent="call">{{ kefu }}</text>
				<u-loading mode="flower" :show='show' size="36"></u-loading>
			</view>
			<view class="auto">
				<u-count-down :timestamp="timestamp" separator="zh" font-size='34' :show-days="false" :show-hours="false" margin='auto'
				 color="#1b4994" @change="change"></u-count-down>
			</view>
		</view>
	</view>
</template>

<script>
	import api from '@/common/api/index.js'
	export default {
		props: {
			zhan: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				type: 1,
				load: false,
				show: true,
				color: 'red',
				active:true,
				customStyle: {
					borderRadius: "50%",
					width: '94px',
					height: '94px',
					textAlign: 'center',
					fontSize: '20px',
					boxShadow: '1px 4px 8px #ff9c38',
					position:'absolute',
					backgroundColor:'#f8a34fdb',
					top:0,
					bottom:0,
					left:0,
					right:0,
					margin:'auto',
				},
				disabled: false,
				timestamp: 300,
				seconds: 300,
				tel: null,
			}
		},
		onReady() {
			let uThis = this;
			api.telPhone().then(res => {
				uThis.tel = res.tel;
				uThis.show = false;
			})
		},
		computed: {
			kefu() {
				return this.tel
			},
			tishi() {
				if (this.type == 2) {
					return '请联系客服!'
				}
				if (this.seconds >= 200) {
					return '高效清洁泡沫车身喷洒，高效去污！'
				}
				if (this.seconds >= 120) {
					return '无孔纤维棉刷，感应车型外观刷洗！'
				}
				if (this.seconds < 120 && this.seconds != 0) {
					return '强力风机，无触仿形风干！'
				}
				return '洗车完成，欢迎下次光临！'
			},
			showStatus() {
				let viewText = {
					'1': '正在洗车...',
					'2': '已暂停',
					'3': '正在复位'
				};
				return viewText[this.type];
			},
			buttonText() {
				let viewText = {
					'1': '紧急停止',
					'2': '已停止',
					'3': '正在复位'
				};
				return viewText[this.type];
			}
		},
		methods: {
			change(timestamp) {
				this.seconds = timestamp;
				if (timestamp == 0) {
					//洗车完成
					this.$tool.uniShowToast({
						title: "洗车完成！"
					})
					setTimeout(() => {
						this.$tool.uniReLaunch({
							url: '/pages/index/index'
						})
					}, 1000)
				}
			},
			call() {
				uni.makePhoneCall({
					phoneNumber: this.tel
				});
			},
			stop() {
				let uThis = this;
				let type = 2; //this.buttonText == '紧急停止'?2:3;//this.type == 1 ? 2: this.type == 2?3:1;
				this.load = true;
				api.zhan({
					zhan_id: uThis.zhan,
					zhan_type: type,
				}).then(res => {
					uThis.load = false; //加载动画
					uThis.disabled = true; //按钮
					uThis.timestamp = 0; //倒计时
					uThis.color = 'gray'; //颜色
					uThis.active = false;
					uThis.type = type; //洗车机状态	

					// if(type == 3){//当复位时
					// 	this.load = true;
					// 	setTimeout(()=>{
					// 		//在次执行开机
					// 		api.zhan({
					// 			zhan_id:uThis.zhan,
					// 			zhan_type:1,
					// 		}).then( res => {
					// 			this.load = false;
					// 			this.type = 1;//洗车机状态
					// 		})
					// 	},3000)
					// }
				})

			}
		}
	}
</script>

<style scoped lang="scss">
	page {
		height: 100%;

		.wrap {
			height: 100%;

			.body {
				height: 100%;
				position: relative;
				padding-top: 30rpx;

				.showStatus {
					width: 200rpx;
					height: 200rpx;
					line-height: 200rpx;
					font-size: 30rpx;
					margin: auto;
					text-align: center;
					border-radius: 50%;
				}

				.auto {
					margin: 30rpx auto;
					text-align: center;
					position: absolute;
					width: 100%;
					height: 40rpx;
					bottom: 100rpx;
				}

				.kefu {
					text-align: center;
					position: absolute;
					width: 100%;
					height: 40rpx;
					bottom: 400rpx;
					font-size:32rpx;
				}

				.kefu_b {
					color: #1b4994;
				}

				.tishi {
					text-align: center;
					position: absolute;
					width: 100%;
					height: 40rpx;
					bottom: 500rpx;
					font-size:32rpx;
				}

				.text {
					margin: auto;
					z-index: 99;
					width: 100%;
					height: 200rpx;
					font-size: 69rpx;
					text-align: center;
					position: relative;
				}

				.image {
					position: absolute;
					top: 0;
					width: 200rpx;
					height: 200rpx;
					left:0;
					right:0;
					margin: auto;
					.circle {
						position: absolute;
						width: 300%;
						height: 300%;
						top: -100%;
						bottom: -100%;
						left:-100%;
						right:-100%;
						
					}
				}
			}
		}
	}
	.c1{
		animation:myRotate 10s -2s infinite linear;
	}
	.c2{
		transform-origin: center
		// animation:myRotate 9s linear infinite;
	}
	.c3{
		animation:myRotate 16s 1s infinite linear;
	}
	.c4{
		animation:myRotate 6s 1s  infinite linear reverse;
	}
	.c5{
		animation:myRotate 4s 1s  infinite linear;
	}
	.c6{
		animation:myRotate 8s 1s infinite linear alternate;
	}
	.c7{
		animation:myRotate 4s 1s infinite linear reverse;
	}
	.c8{
		transform-origin: center;
	}
	@keyframes myRotate{
	    0%{ transform: rotate(0deg);}
	    100%{ transform: rotate(360deg);}
	}
</style>
