<template>
	<view class="my-car bg-page h100">
		<view class="header flex a-center j-between flex-row">
			<view class="left">我的车辆</view>
			<view class="right" @click="actionHandle('add')">添加</view>
		</view>
		<view class="list-wrap" v-if="list.length>0">
			<view class="box flex a-center j-between flex-row" v-for="(item,index) in list" :key='index'>
				<view class="left  bold text-black">{{item.detail}}</view>
				<view class="right flex flex-column a-center j-between">
					<view class="edit" @click="actionHandle('edit',item)">编辑</view>
					<view class="del" @click="actionHandle('del',item)">删除</view>
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
					url: `/api/address/lists`,
					success: (res) => {
						this.list=res.list
						this.noDateTitle=this.list.length===0?'暂无数据':'没有更多数据了'
					}
				})
			},
			actionHandle(type,item=null){
				let _this=this
				if(type==='del'){
					uni.showModal({
					    title: '提示',
					    content: '您确定要删除该车辆码？',
					    success: function (res) {
					        if (res.confirm) {
					            _this.del(item.address_id)
					        } else if (res.cancel) {
					            console.log('用户点击取消');
					        }
					    }
					})
				}else{
					let url=""
					if(type==='add'){
						url=`/pages/base/add-car?pageForm=car&status=${type}`
					}else{
						url=`/pages/base/add-car?pageForm=car&status=${type}&detail=${JSON.stringify(item)}`
					}
					this.$tool.uniNavigateTo({
						url:url
					})
				}
			},
			del(id){
				this.$tool.uniRequest({
					url: `/api/address/delete`,
					method:'POST',
					params:{
						address_id:id
					},
					success: (res) => {
						this.$tool.uniShowToast({
							title: "删除成功！",
						})
						this.init()
					}
				})
			}
		}
	}
</script>

<style scoped lang="less">
.my-car{
	padding-top: 20rpx;
	.header{
		padding: 20rpx;
		.left{
			color: #7B7C80;
		}
		.right{
			display: inline-block;
			border-radius: 10rpx;
			background-color: #FF8D1A;
			padding: 10rpx 20rpx;
			color: white;
			font-size: 28rpx;
		}
	}
	.list-wrap{
		margin-top: 30rpx;
		padding: 0 20rpx;
		.box{
			background: url(../../static/image/car-bg.png) no-repeat;
			background-size: 100% 100%;
			border-radius: 10rpx;
			height: 150rpx;
			margin-top:20rpx;
			padding:20rpx 40rpx;
			color: white;
			.right{
				font-size: 30rpx;
				height: 100%;
			}
		}
	}
}
</style>
