<template>
	<view class="site bg-page h100">
		<view class="content">
			<view class="card flex a-center j-between flex-row" v-for="(item,index) in cardList" :key='index' @click="toPage(item)">
				<image :src="item.goods_image"  class="left"></image>
				<view class="mid">
					<view class="title nowrap">{{item.goods_name}}</view>
					<view class="address">{{item.goods_df}}</view>
					<view class="other flex flex-row a-center j-start">
						<view class="distance flex flex-row a-center j-start">
							<image src="../../static/image/l-c1.png" class="img"></image>
							<text>{{$tool.distanceHanlde(item.goods_distance)}}</text>
						</view>
						<view class="flex flex-row a-center j-start">
							<image src="../../static/image/l-c2.png" class="img"></image>
							<text>{{item.goods_time}}</text>			
						</view>
					</view>
				</view>
				<view class="right" :class="[item.goods_status.text==='正常营业'?'text-yellow':'text-black']">
					{{item.goods_status.text}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				page:1,
				total:0,
				category_id:1,
				cardList:[],
				isPullDown:false,
				addressInfo:null,
				coupon_id:null
			}
		},
		onLoad(options){
			this.coupon_id=options.coupon_id || null
			this.page=1
			this.isPullDown=true
			this.init()
		},
		onPullDownRefresh(){
			this.page=1		
			this.isPullDown=true
			this.init()
		},
		onReachBottom(){
			console.log("触底了")
			this.isPullDown=false		
			if(this.total>this.cardList.length){
				this.page+=1
				this.init()
			}
		},
		methods:{			
			init(){			
				this.addressInfo=this.$tool.uniGetStorage("addressInfo")			
				if(this.addressInfo.category_id || this.coupon_id){
					this.getListInfo(this.addressInfo.category_id)
				}else{
					this.getNewListInfo(this.addressInfo.lat,this.addressInfo.lng)
				}		
			},
			getNewListInfo(lat,lng) {
				this.$tool.uniRequest({
					url: `/api/index/page`,
					params:{
						lat:String(lat),
						lng:String(lng)
					},
					success: (res) => {			
						this.cardList = res && res.posiList ? res.posiList : []
						this.total=this.cardList.length
					},					
					complete:()=>{
						this.isPullDown=false
						uni.stopPullDownRefresh()
					}
				})
			},
			getListInfo(category_id){
				this.$tool.uniRequest({
					url: `/api/goods/lists`,
					params:{
						page:this.page,
						search:'',
						coupon_id:this.coupon_id || '',
						category_id:this.coupon_id?'': category_id,
						lat:String(this.addressInfo.lat),
						lng:String(this.addressInfo.lng)
					},
					success: (res) => {									
						if(this.isPullDown){
							this.cardList=[]
						}
						this.cardList=this.cardList.concat(res.posiList)
						this.total=res.pages.total 					
					},
					complete:()=>{
						this.isPullDown=false
						uni.stopPullDownRefresh()
					}
				})
			},
			toPage(item){
				this.$tool.uniNavigateTo({
					url:`/pages/index/site-detail?id=${item.goods_id}`
				})
			}
		}
	}
</script>

<style scoped lang="less">
	.site{
		.ad-wrap{
			height: 176rpx;
			.img{
				border-radius: 4rpx;
			}
		}
		.content{
			padding:0 20rpx;
			.card{
				border-bottom: 2rpx solid #d7dae2;
				height: 204rpx;
				.left{
					width: 130rpx;
					height: 130rpx;
					flex-shrink: 0;
				}
				.mid{
					width: 55%;
					padding: 30rpx 30rpx;
					.title{
						color: black;
						font-size: 32rpx;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
					.address{
						color: #97989a;
						font-size: 23rpx;
						overflow: hidden;
						line-height: 30rpx;
						margin: 10rpx 0;
					}
					.other{
						color: #5F6366;
						font-size: 23rpx;
						.img{
							width: 24rpx;
							height: 24rpx;
							margin-right: 6rpx;
						}
						.distance{
							display: inline-block;
							margin-right: 40rpx;
						}
					}
				}
				.right{
					width: 25%;
					font-size: 30rpx;
					text-align: right;
				}
			}
		}
	}
</style>
