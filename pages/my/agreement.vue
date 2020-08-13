<template>
	<view class="agreement bg-page h100">
		<view class="content">
			<view class="header">用户协议</view>
			<view class="list" v-if='list.length>0'>
				<view class="line flex a-center flex-row j-between"  @click="toRichPage(item)" v-for="(item,index) in list" :key='index'>
					<view class="left">
						《{{item.title}}》
					</view>
					<view class="right" >
						<img src="../../static/image/show.png"  class="show-icon" >
					</view>
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
				noDateTitle:"暂无数据",
				list:[]
			}
		},
		onLoad(){
			this.init()
		},
		methods:{
			init(){
				this.getListInfo()
			},
			getListInfo(){
				this.$tool.uniRequest({
					url: `/api/wxapp/help`,
					success: (res) => {
						this.list=res.list
						this.noDateTitle=this.list.length===0?'暂无数据':'没有更多数据了'
					}
				})
			},
			toRichPage(item){
				this.$tool.uniNavigateTo({
					url:`/pages/base/rich?id=${item.help_id}&fromPage=agreement`
				})
			}
		}
	}
</script>

<style scoped lang="less">
.agreement{
	.header{
		height: 80rpx;
		line-height: 80rpx;
		padding: 0 20rpx;
		color: #999999;
		font-size: 24rpx;
		border-bottom:2rpx solid #272A2F;
	}
	.list{
		border-bottom:2rpx solid #272A2F;
		.line{
			margin: 0 20rpx;
			height: 88rpx;
			&:not(:last-child){
				border-bottom: 2rpx solid #272A2F;
			}
			.left{
				font-size: 28rpx;
				color: white;
			}
			.right{
				.show-icon{
					width: 30rpx;
					height: 30rpx;
				}
			}
		}
	}
}
</style>