<template>
	<view class="card-detail">
		<view class="content" v-if="detail">
			<view class="header flex a-center j-center">
				<image :src="detail.images" class="img"></image>
			</view>
			<view class="info-wrap">
				<view class="line">
					{{detail.plan_name}}
				</view>
				<view class="line">
					{{detail.title}}
				</view>
				<view class="line1" @click="toListPage">
					查看适用站点（{{counts}}个）
				</view>
			</view>
			<view class="des-wrap" v-if="detail" >
				详情介绍：
				<rich-text :nodes="strContent(detail)"></rich-text>
			</view>
			<view class="agreement-wrap flex a-center flex-row j-start">
				<text class="checkBox" @click="isAgreement=!isAgreement" :class="[isAgreement && 'isChecked']"></text>
				<text @click="isAgreement=!isAgreement">同意</text>
				<text class="font" @click="toAgreement">《服务协议》</text>
			</view>
			<view class="btn-wrap flex a-center j-between flex-row">
				<view class="price-wrap">
					<text class="price1">总价 ￥{{detail.money}}</text>
					<text class="price2">￥{{detail.del_money}}</text>
				</view>
				<view class="btn" @click="pay">
					立即支付
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				detail:null,
				isAgreement:true,
				detailId:null,
				counts:0
			}
		},
		
		onLoad(options){
			this.detailId=options.id
			this.getDetail()
		},
		methods:{
			strContent(detail){
				if(!detail || !detail.content)return ''
				let str=this.$tool.htmlre(detail.content)
				console.log(str)
				return str
			},
			getDetail(){
				let _this=this
				this.$tool.uniRequest({
					url: `/api/recika/detail`,	
					params:{
						recika_id:this.detailId
					},	
					success: (res) => {
						this.detail=res.detail[0]	
						
						this.counts=res.detail[0].goodscount || 0
					}
				})
			},
			toListPage(){
				this.$tool.uniNavigateTo({url:`/pages/index/site?coupon_id=${this.detail.coupon_id}`})
			},
			toAgreement(){
				this.$tool.uniNavigateTo({url:'/pages/base/rich?fromPage=serviceAgreement'})
			},
			pay(){
				if(!this.isAgreement){
					this.$tool.uniShowToast({
						title: "同意才能支付！",
						icon:'none'
					})
					return
				}
				let _this=this
				let params = {
						planId:this.detail.plan_id,
						customMoney:this.detail.gift_money,
					}
					console.log("支付参数",params)
				this.$tool.uniRequest({
					url: `/api/recika/submit`,
					method: "POST",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},  
					params:params,
					success: (res) => {		
						let result=res.payment
						_this.$tool.wxPayMoney(result.timeStamp,result.nonceStr,result.prepay_id,'MD5',result.paySign,(req)=>{
							_this.$tool.uniShowToast({
								title: "支付成功！",
							})
							console.log("支付成功",res)
							setTimeout(()=>{
								_this.$tool.uniRedirectTo({
									url:"/pages/my/volume"
								})	
							},1000)
						})
											
					}
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.card-detail{
		.content{
			padding-bottom: 150rpx;
			.header{	
				margin: 20rpx 0;
				.img{
					width: 600rpx;
					height: 360rpx;
					border-radius: 10rpx;
				}
			}
			.info-wrap{
				padding: 20rpx 40rpx;
				border-bottom:20rpx solid #F2F2F2 ;
				.line{
					font-size: 34rpx;
					line-height: 2;
				}				
				.line1{
					font-size: 34rpx;
					color: #FF8D1A;
					line-height: 2;
				}
			}
			.des-wrap{
				padding: 20rpx 40rpx;
				border-bottom:2rpx solid #F2F2F2 ;
				font-size: 30rpx;
			}
			.agreement-wrap{
				padding: 20rpx 40rpx;	
				font-size: 28rpx;
				.font{
					color: #2A82E4;
					display: inline-block;
					margin-left: 20rpx;
				}
				.checkBox{
					display: inline-block;
					width: 32rpx;
					height: 32rpx;
					border-radius: 50%;
					border:2rpx solid #FF8F1E;
					margin-right: 10rpx;
					position: relative;
				}
				.checkBox.isChecked::after{
					content: '';
					width: 20rpx;
					height: 20rpx;
					border-radius: 50%;
					background: #FF8F1E;
					position: absolute;
					top: 7rpx;
					left: 7rpx;
				}
			}
			.btn-wrap{
				position: fixed;
				bottom: 0;
				left: 0;
				right: 0;
				background: white;
				height: 120rpx;
				padding: 0 40rpx;
				border-top:2rpx solid #F2F2F2 ;
				.price-wrap{
					
					.price1{
						font-size: 32rpx;
						color: #FF972F;
						display: inline-block;
						margin-right: 30rpx;
					}
					.price2{
						font-size: 26rpx;
						color: #A6A6A6;
						text-decoration:line-through;
					}
				}
				.btn{
					padding: 20rpx 40rpx;
					color: white;
					background: #FF8D1A;
					border-radius: 50000rpx;
					font-size: 28rpx;
				}
			}
		}
	}
</style>
