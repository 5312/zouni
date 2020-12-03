<template>
	<view class="auto-login h100 flex a-center j-center">
		<view class="content flex flex-column a-center j-between">
			<view class="title">{{status==='userInfo'?'授权登陆':'授权地址位置'}}</view>
			<view class="info-msg">
				请授权头像等信息，以便我们为您提供更好的服务
			</view>
			
			<button open-type="getUserInfo" @getuserinfo="bindGetUserInfo" class="btn" :loading="loading" :disabled="loading" v-if="status==='userInfo'">
				微信一键登录
			</button>		
			<button @click="handler" class="btn"  v-if="status==='userLocation'">
				授权地址位置
			</button>
			<view class="registration-agreement text-gray">授权即视为同意<text class="text-green" @click="look">《注册协议》《服务协议》</text></view>
		</view>
	</view>
</template>

<script>
	export default{
		props:{
			status:{
				type:String,
				default:"userInfo"
			}
		},
		data(){
			return{
				loading:false
			}
		},
		methods:{
			look(){
				this.$tool.uniNavigateTo({
					url:`/pages/base/rich?fromPage=registrationAgreement`
				})
			},
			bindGetUserInfo(e){
				var _this=this;		
				if (e.detail.userInfo){	
					this.loading=true
					uni.getSetting({
					  success(res1) {    	   
						console.log("res1",res1)
						if (!res1.authSetting['scope.userInfo']) {//未授权getUserInfo            	
						  uni.authorize({
							scope: 'scope.getUserInfo',
							success(res2) {	  
								_this.$tool.getTokenValue({
									success:()=>{
										_this.$emit("loginOk",true)
									},
									complete:()=>{
										_this.loading=false	
									}
								})
							},
							fail(err){  
								_this.$tool.uniShowToast({
									title: "您拒绝了授权，无法获取小程序信息，请前往授权",
									icon: "none"
								})
								_this.loading=false	
							}
						  })
						}else{//已授权	
							_this.$tool.getTokenValue({
								success:()=>{
									_this.$emit("loginOk",true)
								},
								complete:()=>{
									_this.loading=false	
								}
							})
						}
					  }
					})												
				} else {
					_this.$tool.uniShowToast({
						title: "用户拒绝了授权",
						icon: "none"
					})
				}
			},		
			handler(){
				let _this=this
				uni.openSetting({
				  success(res) {
					console.log(res)
					if(res.authSetting['scope.userLocation']){
						_this.$emit("loginOk",true)
					}
				  }
				})
			},
		}
	}
</script>

<style scoped lang="less">
.auto-login{
	background: rgba(0,0,0,0.6);
	z-index: 99999;
	.content{
		width: 80%;
		height: 700rpx;
		background: white;
		border-radius: 8rpx;
		padding-top:40rpx;
		.title{
			font-size: 34rpx;
			margin-bottom: 80rpx;
			font-weight: bold;
		}
		.info-msg{
			font-size: 28rpx;
			margin-bottom: 60rpx;
			padding: 0 60rpx;
			color: grey;
		}
		.registration-agreement {
			margin-bottom: 40rpx;
			font-size: 24rpx;
		}
		.btn{
			padding: 8rpx 0rpx;
			width: 80%;
			text-align: center;
			background:  #FF8D1A;
			border-radius: 45rpx;
			font-size: 26rpx;
			color: white;
		}
	}
}
</style>
