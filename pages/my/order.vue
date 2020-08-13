<template>
	<view class="order bg-page">
		<view class="header flex a-center j-center flex-row">
			<view class="nav-wrap flex a-center j-center flex-row">
				<view :class="['nav',dataType===item.dataType?'nav-active':'']" 
					v-for="(item,index) in navList" :key='index' @click="select(item)">
					{{item.name}}
				</view>
			</view>
		</view>
		<view class="list-wrap bg-page" v-if="list.length>0">
			<view class="box flex a-start j-between flex-column" v-for="(item,index) in list" :key="index" 
				@click.stop.prevent="toDetail(item)">
				<view class="top flex a-center j-between flex-row w100">
					<text class="left bold ">{{item.goods[0].goods_car}}</text>
					<text class="right bold ">{{item.pay_status.text}}</text>
				</view>
				<view class="mid   w100">{{item.goods[0].goods_name}}</view>
				<view class="bottom flex a-center j-between flex-row w100">
					<text >￥{{item.pay_price}}  {{item.pay_type.text}}</text>
					<text >{{item.create_time}}</text>
				</view>		
			</view>			
		</view>
		<NoDate v-if="isNoDate" :title='noDateTitle'></NoDate>
	</view>
</template>

<script>
	import NoDate from "../../components/base/no-data.vue"
	export default{
		components:{
			NoDate
		},
		data(){
			return{
				isNoDate:true,
				list:[],
				page:1,
				isPullDown:false,
				dataType: 'delivery',
				total:0,
				noDateTitle:"暂无数据",
				navList:[
					{
						name:"已支付",
						dataType:"delivery"
					},
					{
						name:"未支付",
						dataType:"payment"
					}
				]
			}
		},
		onLoad(){
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
			this.isPullDown=false		
			if(this.total>this.list.length){
				this.page+=1
				this.init()
			}
		},
		methods:{
			init(){
				this.getListInfo()
			},
			del(item){
				let _this=this
				uni.showModal({
				    title: '提示',
				    content: '确定要取消该订单吗？',
				    success: function (res) {
				        if (res.confirm) {
				            _this.$tool.uniRequest({
				            	url: `/api/user.order/cancel`,
				            	params:{
				            		order_id:item.order_id
				            	},
				            	success: (res) => {
				            		_this.$tool.uniShowToast({
				            			title: "取消成功！",
				            		})			
									_this.getListInfo()
				            	}
				            })
				        } else if (res.cancel) {
				            console.log('用户点击取消');
				        }
				    }
				})
			},
			select(item){
				if(this.dataType===item.dataType)return
				this.dataType=item.dataType
				this.page=1
				this.isPullDown=true
				this.getListInfo()
			},
			toDetail(item){
				this.$tool.uniNavigateTo({
					url:`/pages/my/order-detail?id=${item.order_id}`
				})
			},
			getListInfo(){
				this.$tool.uniRequest({
					url: `/api/user.order/lists&dataType=${this.dataType}`,
					params:{
						page:this.page
					},
					success: (res) => {			
						if(this.isPullDown){
							this.list=[]
						}
						this.list=this.list.concat(res.list.data)
						this.total=res.list.total
						this.noDateTitle=this.list.length===0?'暂无数据':'没有更多数据了'
					},
					complete:()=>{
						this.isPullDown=false
						uni.stopPullDownRefresh()
					}
				})
			}
		}
	}
</script>

<style scoped lang="less">
	.order{
		padding: 10rpx 10rpx 40rpx 10rpx;
		.header{
			font-size: 30rpx;
			margin: 10rpx 0;
			border-bottom: 1rpx solid #E5E5E5;
			.nav-wrap{			
				.nav{
					padding: 30rpx 80rpx;		
					&-active{
						color: #FF8D1A;	
						border-bottom: 1rpx solid #FF8D1A;
					}
				}
			}
			
		}
		.list-wrap{
			margin-top: 30rpx;
			padding: 0 20rpx;
			.box{
				background: #FF8D1A;
				border-radius: 10rpx;
				height: 200rpx;
				margin-top:20rpx;
				padding: 40rpx;
				position: relative;
				.bottom{
					font-size: 24rpx;
					color: #383838;
				}
				.del{
					position: absolute;
					right: 30rpx;
					top: 50%;
					margin-top: -32rpx;
					font-size: 24rpx;
					color: #0079FF;
					padding: 10px 20rpx;
				}
			}
		}
	}
</style>
