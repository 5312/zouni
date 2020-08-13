<template>
	<view class="my bg-page h100 relative">
		<template v-if='isLogin'>
			<view class="header-wrap flex a-center j-start flex-column" @click="myInfoPage">
				<view class="top radius">
					<image :src="userInfo.avatarUrl" mode="aspectFill" class="avatar w100 h100" v-if="userInfo"></image>
				</view>
				<view class="bottom">
					<view class="name">{{userInfo.nickName || '登陆'}}</view>
				</view>
			</view>
			<view class="nav-wrap flex a-center flex-row j-start absolute">
				<view class="nav flex a-center flex-column j-center" @click="toPage('order')" >
					<image src="../../static/image/my-order.png" class="icon"></image>
					<text class="nav-text">我的订单</text>
				</view>
				<view class="nav flex a-center flex-column j-center" @click="toPage('vip')">	
					<image src="../../static/image/my-money.png" class="icon"></image>
					<text class="nav-text">钱包</text>
				</view>
				<view class="nav flex a-center flex-column j-center"  @click="toPage('volume')">
					<image src="../../static/image/my-juan.png" class="icon"></image>
					<text class="nav-text">优惠券</text>
				</view>				
			</view>
			<view class="list-wrap absolute">
				<view class="tar-h"></view>
				<template v-for="(item,index) in myList">
					<view class="line flex a-center flex-row j-between"  :class="[index==2 || index==5 ||  index==myList.length-1?'':'line-boder-bottom']"
						:key='index' @click="toListPage(item)">
						<view class="left flex a-center flex-row j-start">
							<img :src="item.img" alt="icon" class="icon">
							<text class="name">{{item.name}}</text>
						</view>
						<view class="right flex flex-row  a-center j-end">
							<text v-if="item.info" class="right-info">{{item.info}}</text>
							<img src="../../static/image/show1.png"  class="show-icon">
						</view>
					</view>
					<view class="tar-h" v-if="index==2 || index==5"></view>
				</template>
			</view>
			<view class="contact-wrap fixed p-tblr" v-if="isContact" @click.stop.prevent="close">
				<view class="content absolute" >
					<view class="contact-line text-center">{{phone}}</view>
					<view class="contact-line text-center" @click.stop.prevent="call">呼叫</view>
					<view class="contact-line text-center" @click.stop.prevent="close">取消</view>
				</view>
			</view>
		</template>
		<AuthLogin v-if="!isLogin && isShowAuthLogin" @loginOk='loginOk' :status="'userInfo'"></AuthLogin>
		<view class="mask flex j-center a-center" v-if="isCouponCounts">
			<view class="contnet flex flex-column a-center j-between">
				<view class="close-wrap">
					<text class="close" @click="isCouponCounts=false">X</text>
				</view>
				<view class="title">
					优惠提醒
				</view>
				<view class="info">
					恭喜，你还有{{couponCounts}}张优惠券未使用！
				</view>
				<view class="btn" @click="lookCoupon">
					查看优惠
				</view>
			</view>
		</view>
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
				couponCounts:0,
				isShowAuthLogin:false,
				isContact:false,
				phone:0,
				userInfo:null,
				orderCount:null,
				isCouponCounts:false,
				myList:[
					{
						img:"../../static/image/11.png",
						name:"我的车辆",
						path:"/pages/my/my-car"
					},{
						img:"../../static/image/my-yao.png",
						name:"邀请好友",
						info:"邀请好友免费洗车劵",
						isNoOpen:true,
					},{
						img:"../../static/image/my-juan.png",
						name:"优惠券兑换",
						isNoOpen:true,
					},{
						img:"../../static/image/08.png",
						name:"关于我们",
						path:"/pages/base/rich?fromPage=about"
					},{
						img:"../../static/image/09.png",
						name:"联系我们",
						prop:"contact"
					},{
						img:"../../static/image/10.png",
						name:"服务协议",
						path:"/pages/base/rich?fromPage=serviceAgreement"
					},{
						img:"../../static/image/help.png",
						name:"帮助中心",
						path:"/pages/my/help"
					}
				],		
			}
		},
		onLoad(){
			this.getPthone()
			this.init()
		},
		onShow(){
			let isEditUserInfo=this.$tool.uniGetStorage('isEditUserInfo')
			//console.log("isShow")
			if(isEditUserInfo){
				this.$tool.uniRemoveStorage('isEditUserInfo')
				this.init()
			}
		},
		methods:{
			init(){
				this.$tool.isGetLocation("scope.userInfo",()=>{					
					this.getNewToken()
				},()=>{
					this.isLogin=false
					this.isShowAuthLogin=true
				})
			},
			myInfoPage(){
				if(!this.userInfo){
					this.$tool.getTokenValue({
						success:()=>{
							this.getNewToken()
						}
					})				
				}else{
					this.$tool.uniNavigateTo({url:"/pages/my/my-info"})
				}
			},
			lookCoupon(){
				this.isCouponCounts=false
				this.toPage('volume')
			},
			getNewToken(){
				this.logged()
			},
			loginOk(){
				this.getNewToken()
			},
			getCouponCounts(){
				this.isCouponCounts=false
				this.$tool.uniRequest({
					url: `/api/user.coupon/getcounts`,
					success: (res) => {
						this.isCouponCounts=res && res.count>0?true:false
						this.couponCounts=res && res.count>0?res.count:0
					}
				})
			},
			getPthone(){
				this.$tool.uniRequest({
					url: `/api/Tel`,
					success: (res) => {
						this.phone=res.tel
					}
				})
			},
			logged(){
				let _this=this
				this.$tool.uniRequest({
					url: `/api/user.index/detail`,
					params:{
						wxapp_id:"10001",
						token:this.$tool.uniGetStorage("token")
					},
					success: (res) => {
						_this.userInfo=res.userInfo
						_this.orderCount=res.orderCount
						_this.isLogin=true
						_this.isShowAuthLogin=false
						_this.getCouponCounts()					
					}
				})
			},
			toPage(type){
				if(type==='vip'){
					this.$tool.uniShowToast({
						title: "稍后开放！",
						icon: "none"
					})
					return
				}
				let url=""
				switch(type) {
				    case 'volume':
				        url="/pages/my/volume"
				        break;
				    case 'vip':
				        url="/pages/vip/index"
				        break;
					case 'order':
					    url="/pages/my/order"
					    break;
				    default:
						url="/pages/index/index"
				} 
				this.$tool.uniNavigateTo({url})
			},
			toListPage(item){
				if(item.isNoOpen){
					this.$tool.uniShowToast({
						title: "稍后开放！",
						icon: "none"
					})
					return
				}
				if(item.path){
					this.$tool.uniNavigateTo({url:item.path})
				}else if(item.prop==='invoice'){
					uni.showModal({
					    title: '温馨提示',
					    content: '请按照如下提示获取发票',
					    success: function (res) {
					        if (res.confirm) {
					            console.log('用户点击确定');
					        } else if (res.cancel) {
					            console.log('用户点击取消');
					        }
					    }
					})
				}else if(item.prop==='contact'){
					this.isContact=true
				}
			},
			close(){
				this.isContact=false
			},
			call(){
				uni.makePhoneCall({
				    phoneNumber: this.phone
				});
			}
		}
	}
</script>

<style lang="less" scoped>
.my{
	.mask{
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0,0,0,0.6);
		z-index: 99999;
		.contnet{
			background: white;
			width: 560rpx;
			height: 500rpx;
			padding: 30px;
			border-radius: 10rpx;
			box-sizing: border-box;
			position: relative;
			.close-wrap{
				position: absolute;
				right: 24rpx;
				top: 24rpx;
				width: 40rpx;
				height: 40rpx;
				text-align: center;
				line-height: 40rpx;
			}
			.title{
				font-size: 40rpx;
				font-weight: bold;
				color: #FF8B16;
			}
			.info{
				font-size: 30rpx;
			}
			.btn{
				width: 220rpx;
				height: 80rpx;
				text-align: center;
				line-height: 80rpx;
				font-size: 30rpx;
				background: #FF8D1A;
				border-radius: 10rpx;
			}
		}
	}
	.header-wrap{
		height: 280rpx;
		padding: 0 40rpx;
		background: #FF8D1A;
		background-size: 100% 100%;
		padding-top: 45rpx;
		box-sizing: border-box;
		.top{
			width: 128rpx;
			height: 128rpx;
			border: 2px solid white;
			overflow: hidden;
		}
		.bottom{
			margin-top: 20rpx;
			.name{
				font-size: 34rpx;	
			}
		}
	}
	.nav-wrap{
		height: 140rpx;
		width: 750rpx;
		top: 280rpx;
		.nav{
			flex: 1;
			flex-shrink: 0;
			position: relative;
			.icon {
				width: 45rpx;
				height: 45rpx;
			}
			.nav-num{
				font-size: 32rpx;
				font-weight: bold;
				color: #FF8D1A;
			}
			.nav-text{
				font-size: 24rpx;
				color: #000000;
				margin-top: 10rpx;
			}
		}
	}
	.list-wrap{
		left: 0;
		right: 0;
		top: 420rpx;
		border-bottom: 1rpx solid #d7dae2;
		.tar-h{
			background: #F2F2F2;
			height: 16rpx;
		}
		.line{
			margin: 0 20rpx;
			height: 88rpx;
			&-boder-bottom {
				border-bottom: 1rpx solid #efefef;
			}
			.left{
				.icon{
					width: 44rpx;
					height: 44rpx;
					margin-right: 20rpx;
				}
				.name{
					font-size: 28rpx;
				}
			}
			.right{				
				.right-info{
					display: inline-block;
					margin-right:10rpx;
					font-size: 26rpx;
					color: #cccccc;
				}
				.show-icon{
					width: 30rpx;
					height: 30rpx;
				}
			}
		}
	}
	.contact-wrap{
		z-index: 300;
		background: rgba(0,0,0,0.2);
		.content{
			background: white;
			left: 0;
			right: 0;
			bottom: 0;
			height: 300rpx;
			border-top-left-radius: 8rpx;
			border-top-right-radius: 8rpx;
			.contact-line{
				height: 100rpx;
				line-height: 100rpx;
				box-sizing: border-box;
				&:nth-child(1){
					border-bottom:2rpx solid #272A2F;
				}
				&:nth-child(2){
					border-bottom:6rpx solid #272A2F;
				}
			}
		}
	}
}	
</style>
