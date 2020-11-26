<template>
	<view class="vip h100">
		<template v-if='isLogin'>
			<view class="header flex flex-row a-center j-between">
				<view class="left radius">
					<image :src="userInfo.avatarUrl" mode="" class="avatar w100 h100" v-if="userInfo"></image>
				</view>
				<view class="mid text-center flex flex-column a-center j-center">
					<text class="money">0</text>
					<text class="balance">钱包余额</text>
				</view>
				<view class="right  text-center" @click="toPage('wallet')">
					查看明细
				</view>
			</view>
			<view class="ad-wrap relative flex flex-column a-start j-center">
				<view class="ad-title">洗车储值</view>
				<view class="ad-info">储值余额，洗车更划算</view>
				<image src="../../static/image/16.png" mode="" class="ad-img absolute"></image>
			</view>
			<view class="card-wrap">
				<view class="card flex a-center j-between flex-row">
					<view class="left text-center">
						<view class="title">200元</view>
						<view class="info">充值200元赠40元</view>
					</view>
					<view class="right">充值</view>
				</view>
			</view>
			<view class="info-wrap text-center">
				<text class="info">点击充值，即表示您已同意</text>
				<text class="text-green" @click="toPage('protocol')">《充值协议》</text>
			</view>
		</template>
		<AuthLogin v-if="!isLogin && isShowAuthLogin" @loginOk='loginOk' :status="'userInfo'"></AuthLogin>
	</view>
</template>

<script>
	import AuthLogin from "../../components/base/auth-login.vue"
	export default{
		components:{
			AuthLogin
		},
		data(){
			return{
				isLogin:false, 
				isShowAuthLogin:false,
				userInfo:null,
				orderCount:null,
			}
		},
		onLoad(){
			this.init()
		},
		methods:{
			init(){
				this.$tool.isGetLocation("scope.userInfo",()=>{
					this.logged()
				},()=>{
					this.isLogin=false
					this.isShowAuthLogin=true
				})
			},
			loginOk(){
				this.logged()
			},
			logged(){
				let _this=this
				this.$tool.uniRequest({
					url: `/api/user.index/detail`,
					params:{
						wxapp_id:"10001",
						token:this.$cache.get("_token")
					},
					success: (res) => {
						if (res.code === 1) {
							_this.userInfo=res.data.userInfo
							_this.orderCount=res.data.orderCount
							_this.isLogin=true
							_this.isShowAuthLogin=false
						} else {
							_this.$tool.uniShowToast({
								title: "请求失败，请重试",
								icon: "none"
							})
						}						
					}
				})
			},
			toPage(type){
				let url=""
				switch(type) {
				    case 'wallet':
				        url="/pages/vip/wallet"
				        break;
					case 'protocol':
					    url="/pages/base/rich?status=protocol"
					    break;
				    default:
						url="/pages/index/index"
				} 
				this.$tool.uniNavigateTo({url})
			}
		}
	}
</script>

<style scoped lang="less">
.vip{
	background: #181C1F;
	.header{
		height: 240rpx;
		background: url("https://xm-img.gaoshilo.com/money_bg.png")  no-repeat;
		background-size: 100% 100%;
		padding: 0 60rpx;
		.left{
			width: 120rpx;
			height: 120rpx;
			border: 4rpx solid #35D5AA;
			overflow: hidden;
		}
		.mid{
			color: #35D5AA;
			.money{
				font-weight: bold;
				font-size: 56rpx;
				height: 88rpx;
				line-height: 88rpx;
			}
			.balance{
				font-size: 28rpx;
			}
		}
		.right{
			width: 192rpx;
			height: 76rpx;
			background: #00FACD;
			border-radius: 10rpx;
			color: #000;
			font-size: 28rpx;
			font-weight: bold;
			line-height: 76rpx;
		}
	}
	.ad-wrap{
		height: 152rpx;
		padding: 0 40rpx;
		margin-bottom: 20rpx;
		.ad-title{
			font-weight: 500;
			font-size: 26px;
			color: #35D5AA;
		}
		.ad-info{
			font-weight: 500;
			font-size: 14px;
			color: #A6A8AC;
		}
		.ad-img{
			width: 180rpx;
			height: 132rpx;
			right: 0;
			top: 50%;
			margin-top: -66rpx;
		}
	}
	.info-wrap{
		font-size: 24rpx;
		.info{
			color: #A6A8AC;
		}
	}
	.card-wrap{
		.card{
			margin: 0 40rpx 40rpx;
			background: #90F0CB;
			border-radius: 10rpx;
			height: 140rpx;
			padding: 0 40rpx;
			.left{
				.title{
					font-size: 40rpx;
					font-weight: bold;
					color: black;
					margin-bottom: 10rpx;
				}
				.info{
					font-size: 24rpx;
					color: #14625C;
				}
			}
			.right{
				padding: 16rpx 40rpx;
				background: #253938;
				color: #90F0CB;
				font-size: 28rpx;
				font-weight: bold;
				border-radius: 6rpx;
			}
		}
	}
}
</style>
