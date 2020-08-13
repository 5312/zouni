<template>
	<view class="scan h100">
		<view class="content" v-if='isLogin'>
			<view class="main" v-if="detail">
				<view class="main-header-wrap">
					<view class="img-wrap flex j-start a-start flex-row">
						<image :src="detail.goods_image" class="img flex"></image>
						<view class="info-wrap right ">
							<view class="name bold text-yellow">
								{{detail.goods_name}}
							</view>
							<view class="address ">
								{{detail.goods_df}}
							</view>
						</view>
					</view>		
					<view class="info-cc">
						本服务站服务项目：{{detail.goods_tag}}
					</view>
				</view>
				<view class="pay-wrap">
					<view class="car-select item flex a-start flex-row j-start">
						<text class="label">车牌号码：</text>
						<text class="flex1">{{carCard}}</text>
					</view>
					<view class="pay-select item flex a-start flex-row j-start">
						<text class="label">支付方式：</text>
						<text class="flex1">微信支付</text>
					</view>
					<view class="pay-select item flex a-start flex-row j-start" v-if="couponList.length>0">
						<text class="label">优惠方式：</text>
						<view class="flex1 inline-block" @click="selectCupon">
							你有{{couponList.length}}张优惠券可使用 
							<image src="../../static/image/more1.png" class="img-c"></image>
						</view>
					</view>
					<view class="pay-select item flex a-start flex-row j-start"  v-if="couponList.length>0">
						<text class="label">优惠金额：</text>
						<text class="flex1">￥{{couponInfoPrice.price}}</text>
					</view>
					<view class="pay-select item flex a-start flex-row j-start">
						<text class="label">支付金额：</text>
						<text class="flex1">￥{{price}}</text>
					</view>
				</view>
				<view class="btn-wrap flex a-center j-center">
					<view class="btn bg-yellow" @click="pay">立即支付</view>
				</view>
			</view>
		</view>
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
				siteId:null,
				detail:null,
				carCard:'',
				price:0,
				couponList:[],
				couponInfoPrice:{
					couponId: 0,
					price:0,
					name:""
				}
			}
		},
		
		onLoad(option){
			console.log("参数",option)
			let q=option.q?decodeURIComponent(option.q):null
			let fromPage=option.fromPage
			if(q){
				let a=q.split('?')[1]
				if(a && a.length>0){
					let b=a.split('=')
					if(b && b.length>0 && b[0]=='siteId'){
						this.siteId=b[1]
						this.init()
					}
				}
			}else if((fromPage ==='addCar' || fromPage ==='home') && option.siteId){
				this.siteId=option.siteId
				this.init()
			}else if(fromPage ==='select'  && option.siteId){
				this.siteId=option.siteId
				this.couponInfoPrice.couponId = option.userCouponId
				this.init()
			}
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
			selectCupon(){
				let url=`/pages/scan/select?list=${JSON.stringify(this.couponList)}&userCouponId=${this.couponInfoPrice.couponId}&siteId=${this.siteId}`
				this.$tool.uniNavigateTo({url})
			},		
			logged(){
				let _this=this
				this.$tool.uniRequest({
					url: `/api/order/buyNow`,
					params:{
						goods_id:this.siteId,
						coupon_id: this.couponInfoPrice.couponId,//默认值为0，选择后传优惠券ID
						goods_sku_id: '0'
					},
					success: (res) => {
						console.log("res",res)
						if(res.exist_car){  //是否有添加车
							_this.detail=res.goods_list[0]
							_this.couponList=res && res.coupon_list?res.coupon_list: []
							_this.carCard=res.car?res.car:''
							_this.price=res.order_pay_price
							_this.couponInfoPrice.price = res.coupon_money
							_this.isLogin=true
							_this.isShowAuthLogin=false
						}else{
							_this.$tool.uniRedirectTo({
								url:`/pages/base/add-car?siteId=${this.siteId}&pageForm=scan&status=add`
							})
						}										
					}
				})
			},
			pay(){
				let _this=this
				let params = {
						wxapp_id:"10001",
						goods_id:this.siteId,
						coupon_id:this.couponInfoPrice.couponId,
						pay_type:'20'
					}
					console.log("支付参数",params)
				this.$tool.uniRequest({
					url: `/api/order/buyNow`,
					method: "POST",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},  
					params:params,
					success: (res) => {		
						if(res.pay_type ==='20'){ //微信支付
							let result=res.payment
							_this.$tool.wxPayMoney(result.timeStamp,result.nonceStr,result.prepay_id,'MD5',result.paySign,(req)=>{
								_this.$tool.uniShowToast({
									title: "支付成功！"
								})
								setTimeout(()=>{
									uni.reLaunch({
									   url:`/pages/scan/order-detail?id=${res.order_id}`
									})	
								},1000)
							})
						}else if(res.pay_type ==='30'){ //优惠卷支付
							_this.$tool.uniShowToast({
								title: "支付成功！"
							})
							setTimeout(()=>{
								uni.reLaunch({
								   url:`/pages/scan/order-detail?id=${res.order_id}`
								})								
							},1000)
						}					
					}
				})
			}
		}
	}
</script>

<style scoped lang="less">
	.scan{
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
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				max-height: 400rpx;
				overflow-y: auto;	
				padding: 0 20px;
				.close-wrap{
					height: 80rpx;
					border-bottom: 2rpx solid #EEEEEE;
					text-align: right;
					line-height: 80rpx;
					box-sizing: border-box;
					.close{
						color: #50A6FF;
						display: inline-block;
						width: 60rpx;
						height: 60rpx;
						text-align: center;
						line-height: 60rpx;
					}
				}
				.line{
					padding: 40rpx 0;
					font-size: 24rpx;
					&-active{
						color: #535EDE;
					}
					&:not(:last-child){
						border-bottom: 2rpx solid #EEEEEE;
					}
				}
			}
		}
		.content{
			.main{				
				.main-header-wrap{
					border-bottom: 1rpx solid #F8F8F8;
					padding-bottom: 20rpx;
				}
				.info-cc{
					padding: 0 40rpx;
					font-size: 30rpx;
					line-height: 56rpx
				}
				.img-wrap{
					padding: 40rpx;
					.img{
						width: 250rpx;
						height: 250rpx;
						border-radius: 6rpx;
						margin-right: 30rpx;
						flex-shrink: 0;
					}
				}
				.info-wrap{						
					.name{
						font-size: 34rpx;
						margin-bottom: 20rpx;
					}
					.address{
						font-size: 28rpx;
						line-height: 1.6;
					}
				}
				.pay-wrap{
					padding: 0 40rpx;
					font-size: 30rpx;
					line-height: 2;
					margin-top: 40rpx;
					.item{
						margin-bottom: 40rpx;
					}
					.img-c{
						width: 30rpx;
						height: 30rpx;
						margin-left: 10px;
						position: relative;
						top: 2rpx;
					}
					.label{
						width: 150rpx;
						flex-shrink: 0;
					}
				}
				.btn-wrap{
					margin-top: 100rpx;
					.btn{
						padding: 20rpx 40px;
						font-size: 26rpx;
						border-radius: 10rpx;
					}
				}
			}
		}
	}
</style>
