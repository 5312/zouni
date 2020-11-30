<template>
	<view class="volume  bg-page h100">
		<template v-if='isLogin'>
			<view class="header flex a-center j-center flex-row">
				<view :class="['nav',navStatus===item.status?'nav-active':'']" v-for="(item,index) in navList" :key='index' @click="select(item)">{{item.name}}</view>
			</view>
			<view class="content">
				<view class="box flex a-center j-start flex-row" v-for="(item,index) in list" :key='index' 
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
			</view>
			<view class="content" v-show="isNoDate"><u-empty  text="没有优惠卷" mode="coupon"></u-empty></view>
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
				isNoDate:true,
				navStatus:'not_use',
				list:[],
				navList:[
					{
						name:"待使用",
						status:"not_use",
					},{
						name:"已使用",
						status:"is_use",
					},{
						name:"已过期",
						status:"is_expire",
					}
				]
			}
		},
		onLoad(){
			this.init()
		},
		methods:{
			init(){
				this.$tool.isGetLocation("scope.userInfo",()=>{
					this.getListInfo()
				},()=>{
					this.isLogin=false
					this.isShowAuthLogin=true
				})
			},
			loginOk(){
				this.getListInfo()
			},
			getStyle(item){
				let style={}
				if(this.navStatus==='not_use'){
					style.backgroundColor=item.color.text
				}else{
					style.backgroundColor='#f0f0f0'
				}
				
				return style
			},
			getListInfo(){
				this.$tool.uniRequest({
					url: `/api/user.coupon/lists&data_type=${this.navStatus}`,
					success: (res) => {					
						this.list=res && res.list?res.list:[]
						this.isNoDate=this.list.length===0?true:false
						this.isLogin=true
						this.isShowAuthLogin=false
					}
				})
			},
			select(item){
				if(this.navStatus===item.status)return
				this.navStatus=item.status
				this.getListInfo()
			}
		}
	}
</script>

<style scoped lang="less">
	.volume{
		.header{
			height: 80rpx;
			line-height: 80rpx;
			color: #969696;
			border-bottom: 1rpx solid #F3F3F3;
			.nav{
				width: 120rpx;
				text-align: center;
				line-height: 80rpx;
				height: 80rpx;
				box-sizing: border-box;
				&-active{
					border-bottom: 5rpx solid #FFC183;
					color: #FFC183;
					box-sizing: border-box;
				}
				&:nth-child(2){
					margin: 0 100rpx;
				}
			}
		}
		.content{
			padding-top: 5px;
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
		}
	}
</style>
