<template>
	<view class="help bg-page h100">
		<view class="content" v-if="list.length>0">
			<view class="header">常见问题</view>
			<view class="list" >
				<view class="line flex a-center flex-row j-between"  @click="toRichPage(item)" v-for="(item,index) in list" :key='index'>
					<view class="left">{{item.title}}</view>
					<view class="right" >
						<img src="../../static/image/show1.png"  class="show-icon" >
					</view>
				</view>	
			</view>
		</view>
		<NoDate v-else></NoDate>
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
				isNoDate:false,
				list:[]
			}
		},
		created(){
			this.init()
		},
		methods:{
			init(){
				this.getHelpList()
			},
			getHelpList(){
				this.$tool.uniRequest({
					url: `/api/wxapp/help`,
					success: (res) => {					
						this.list=res.list
					}
				})
			},
			toRichPage(item){
				this.$tool.uniNavigateTo({
					url:`/pages/base/rich?fromPage=help&id=${item.help_id}`
				})
			}
		}
	}
</script>

<style scoped lang="less">
.help{
	.header{
		height: 80rpx;
		line-height: 80rpx;
		padding: 0 20rpx;
		color: #999999;
		font-size: 24rpx;
		border-bottom:2rpx solid #efefef;
	}
	.list{
		border-bottom:2rpx solid #efefef;
		.line{
			margin: 0 20rpx;
			height: 88rpx;
			&:not(:last-child){
				border-bottom: 2rpx solid #efefef;
			}
			.left{
				font-size: 28rpx;
				
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