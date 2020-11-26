<template>
	<view class="address">
		<view class="header">
			<text class="address-name">{{nowAddress}}</text>
			<image src="../../static/image/more2.png" mode="" class="more_icon"></image>
		</view>
		<view class="new-addres address-box" v-if="newList.length>0">
			<view class="title">定位/最近访问城市</view>
			<view class="box-list flex a-center j-start flex-row flex-wrap">
				<view class="box  flex a-center j-center flex-row" v-for="(item,index) in newList" :key='index' @click="select(item)">
					<image src="../../static/image/ad.png" class="ad" v-if="index==0"></image>
					<text>{{item.name}}</text>
				</view>
			</view>
		</view>
		<view class="hot-address address-box"  v-if="hotList.length>0">
			<view class="title">热门城市</view>
			<view class="box-list flex a-center j-start flex-row flex-wrap">
				<view class="box" v-for="(item,index) in hotList" :key='index'  @click="select(item)">
					{{item.name}}
				</view>
			</view>
		</view>
		<view class="address-list" v-if="addressList.length>0">
			<view class="title">
				所有城市
			</view>
			<view class="list">
				<view class="abc-line" v-for="(item,index) in addressList" :key='index'>
					<view class="abc">{{item.name}}</view>
					<view :class="['abc-children-line',i===item.child.length-1?'':'border-b']" v-for="(val,i) in item.child" :key='i'
						@click="select(val)">{{val.name}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				addressList:[],
				nowAddress:"",
				newList:[],
				hotList:[]
			}
		},
		onLoad(){	
			this.init()
		},
		methods:{
			init(){			
				let addressInfo=this.$cache.get("_addressInfo")
				this.nowAddress=addressInfo.name
				this.getNewList(addressInfo)
				this.getAddress()
			},
			getNewList(addressInfo){
				this.newList=this.$cache.get("_addressNewList")
				this.newList=this.newList?this.newList:[]
				let isHave=false
				let haveIndex=-1
				this.newList.forEach((item,index)=>{
					if(item.name==addressInfo.name){
						isHave=true
						haveIndex=index
					}
				})
				if(!isHave){
					this.newList.unshift({
						category_id:addressInfo.category_id?addressInfo.category_id:"",
						name:addressInfo.name,
						lat:addressInfo.lat,
						lng:addressInfo.lng
					})
				}else{
					this.newList.splice(haveIndex,1)
					this.newList.unshift({
						category_id:addressInfo.category_id?addressInfo.category_id:"",
						parent_id: addressInfo.parent_id?addressInfo.parent_id:"",
						name:addressInfo.name,
						lat:addressInfo.lat,
						lng:addressInfo.lng
					})
				}	
				this.$cache.set("_addressNewList",this.newList)
			},
			async getAddress(){
				const res = await this.$api.categoryLists();
				this.addressList=res.data && res.data.list?res.data.list:[]	
			},
			select(item){
				let addressInfo={
					name:item.name,
					category_id:item.category_id,
					parent_id: item.parent_id,
					lat:item.lat,
					lng:item.lng
				}
				this.$tool.uniReLaunch({
					url:`/pages/index/index?fromPage=address&addressInfo=${JSON.stringify(addressInfo)}`
				})
			}
		}
	}
</script>

<style scoped lang="less">
	.address{
		padding: 20rpx 0rpx;
		min-height: 100vh;
		background: white;
		box-sizing: border-box;
		.header{
			padding: 0 40rpx;
			height: 80rpx;
			line-height: 80rpx;
			.address-name{
				margin-right: 16rpx;
				display: inline-block;
			}
			.more_icon {
				width: 30rpx;
				height: 30rpx;
				position: relative;
				top: 4rpx;
			}
		}
		.address-box{
			padding: 0 40rpx;
			.title{
				font-size: 28rpx;
				color: black;
				font-weight: bold;
				height: 80rpx;
				line-height: 80rpx;
				margin-bottom: 20rpx;
			}
			.box-list{
				.box{
					width: 191rpx;
					height: 60rpx;
					line-height: 60rpx;
					text-align: center;
					border: 2rpx solid #848484;
					font-size: 30rpx;
					margin-bottom: 45rpx;
					border-radius: 6rpx;
					.ad {
						width: 33rpx;
						height: 33rpx;
						margin-right: 4rpx;
						position: relative;
						top: -2rpx;
					}
					&:not(:nth-child(3n)){
						margin-right: 45rpx;
					}
				}
			}
		}
		.address-list{
			.title{
				padding: 0 40rpx;
				border-top: 2rpx solid #C8C7CC;
				font-size: 28rpx;
				color: black;
				font-weight: bold;
				height: 80rpx;
				line-height: 80rpx;
			}
			.list{
				.abc-line{
					.abc{
						height: 60rpx;
						line-height: 60rpx;
						font-size: 26rpx;
						font-weight: bold;
						background: #F2F2F2;
						padding-left: 40rpx;
						background: #F2F2F2;
					}
					.abc-children-line{
						margin: 0 40rpx;
						height: 80rpx;
						line-height: 80rpx;
						font-size: 28rpx;		
						border-bottom: 1rpx solid #F2F2F2;
					}
				}
				.border-b{
					border-bottom: 2rpx solid #F2F2F2;
				}
			}
		}
	}
</style>
