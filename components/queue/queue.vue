<template>
	<view class="mark" :class="{none: none ,markBg:!none}">
		<view class="main text-sl"  :class="{ queueShow: show, queueHide: !show }">
			<view class="cuIcon-roundclosefill close  text-white" @click="close"></view>
			<view class="closeBg"></view>
			<u-image class="video" width="100%" :fade="false" border-radius='10rpx' height="430rpx" :src="capture">
				<u-loading slot="loading"></u-loading>
				<u-icon slot="error" :label="error" label-size='40rpx' size="40" name="info-circle"></u-icon>
				
			</u-image>
			<view class="bottom flex j-between">
				<view class="goods_name">
					<view>{{ name }}</view>
					<view class="flex tag">
						<u-tag v-for="(x,y) in tagText" :key='y' 
						:text='x' 
						class="tag1" 
						mode='dark' 
						shape="circle" 
						type="warning">
						</u-tag>
						
					</view>
				</view>
				<view class="btn">
					<u-button  :loading="load" :ripple="true" :custom-style="customStyle" size="default"  type="warning" @click="refresh">
						刷新
					</u-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		show: {
			type: Boolean,
			default: false
		},
		tag:{
			type: String,
			default: '快洗'
		},
		name: {
			type: String,
			default: '设备维修中'
		},
		goods_id: {
			type: String,
			default: '10036'
		},
		csn:{
			type:String,
			default:''
		}
	},
	watch: {
		show(e) {
			if (e == false) {
				setTimeout(() => {
					//等待动画走完关闭
					this.none = true;
					this.capture = '正在加载';
				}, 300);
			} else {
				//打开时
				this.capture = '正在加载';//回复图片，防止显示上一张
				this.none = false;//关闭弹窗
				this.http();//发送请求
			}
		}
	},
	computed:{
		tagText(){
			let tag = this.tag.split('，')//分割tag标签
			return ['文明排队',...tag];
		}
	},
	data() {
		return {
			load: false,
			none: true,
			capture: null,
			error:'加载中',//图片加载失败文字
			customStyle: {
				fontSize: '25px', // 注意驼峰命名，并且值必须用引号包括，因为这是对象
				padding:'30rpx 20rpx'
			}
		};
	},
	methods: {
		close() {
			this.$emit('closeQueue');
		},
		http() {
			if (!this.csn) {
				this.capture = '/static/image/error.jpg'; //默认图片
				return;
			}
			this.load = true;
			let rThis = this;
			this.$api.capture({
				deviceSerial: rThis.csn,
				zhanid: rThis.goods_id
			}).then(res => {
				if(res.code == 0){
					rThis.load = false;
					rThis.capture = false;//失败
					rThis.error = res.msg
					return
				}
				rThis.load = false;
				rThis.capture = res.data; //图片
			}).catch( err => {
				console.log(err)
				rThis.load = false;
				rThis.capture = false;//设置图片加载失败，这个图片没有
				rThis.error = '请求失败，请重试'
			})

		},
		refresh() {
			let rThis = this;
			this.load = true;
			setTimeout(() => {
				//刷新动作
				rThis.load = false;
			}, 1000);
		}
	}
};
</script>

<style lang="scss" scoped>
page {
	width: 100%;
	height: 100%;
	.mark {
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 99;
		background-color: rgba(58, 51, 51, 0.8);
		.main {
			position: absolute;
			width: 90%;
			height: 580rpx;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			margin: auto;
			z-index: 999;
			background: #fff;
			border-radius: 20rpx;
			.close {
				position: absolute;
				width: 88rpx;
				height: 90rpx;
				top: -20rpx;
				right: -20rpx;
				z-index: 2;
				text-align: center;
				border-radius: 50%;
			}
			.closeBg{
				position: absolute;
				width: 60rpx;
				height: 60rpx;
				top: -5rpx;
				right: -7rpx;
				border-radius: 50%;
				z-index: 1;
				background-color: #000;
			}
			.video {
				border-top-left-radius: 20rpx;
				border-top-right-radius: 20rpx;
			}
			.bottom {
				text-align: center;
				padding: 20rpx;
				margin-top:10rpx;
				.btn{
					padding-top:10rpx;
				}
				.goods_name {
					font-size: 30rpx;
					width: 400rpx;
					text-overflow: ellipsis;
					text-align: left;
					.tag{
						margin:10rpx 0;
						width: 400rpx;
						overflow: hidden;
						.tag1{
							margin-right: 10rpx;
						}
					}
				}
			}
		}
	}
}
@mixin classPulic($name, $status: shows) {
	@if $status==shows {
		.#{$name}Show {
			animation: #{$name}-show 0.3s ease-in both;
		}
	} @else {
		.#{$name}Hide {
			animation: #{$name}-hide 0.3s ease-in both;
		}
	}
}
.none {
	display: none;
}
.markBg{
	animation: markBg 0.3s ease-in both;
}
@include classPulic(queue, hides) @include classPulic(queue, shows) @keyframes queue-show {
	0% {
		transform: scale(1.2);
		opacity: 0;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}
@keyframes queue-hide {
	0% {
		transform: scale(1);
		opacity: 1;
	}
	100% {
		transform: scale(1.2);
		opacity: 0;
	}
}
@keyframes markBg{
	0%{
		background-color: rgba(58, 51, 51, 0.5);
	}
	100%{
		background-color: rgba(58, 51, 51, 0.8);
	}
}
</style>
