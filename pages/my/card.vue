<template>
	<view class="card h100">
		<template v-if='isLogin'>
			<view class="box flex flex-row a-center j-start" v-for="(item,index) in list" :key='index' @click="select(item)">
				<view class="left">
					<image :src="item.images" class="img w100 h100" ></image>
				</view>
				<view class="right  flex flex-column a-start j-between">
					<view class="title">
						{{item.plan_name}}
					</view>
					<view class="info">
						{{item.title}}
					</view>
					<view class="num">
						<text class="price1">￥{{item.money}}</text>
						<text class="price2">￥{{item.del_money}}</text>
					</view>
				</view>
			</view>	
			<NoDate v-if="isNoDate"></NoDate>
		</template>
		<AuthLogin v-if="!isLogin && isShowAuthLogin" @loginOk='loginOk' :status="'userInfo'"></AuthLogin>
	</view>
</template>

<script>
	import NoDate from "../../components/base/no-data.vue"
	import AuthLogin from "../../components/base/auth-login.vue"
	export default{
		components:{
			NoDate,
			AuthLogin
		},
		data(){
			return{
				isLogin:false,
				isShowAuthLogin:false,
				list:[]
			}
		},
		onLoad(){
			this.init()
		},
		methods:{
			init(){
				this.$tool.isGetLocation("scope.userInfo",()=>{
					this.getList()
				},()=>{
					this.isLogin=false
					this.isShowAuthLogin=true
				})
			},
			loginOk(){
				this.getList()
			},
			strContent(detail){
				let str=this.$tool.htmlre(detail)
				str=this.$tool.formatRichText(str)
				return str
			},
			getList(){
				let _this=this
				this.$tool.uniRequest({
					url: `/api/recika/buy`,				
					success: (res) => {
						this.isLogin=true
						this.isShowAuthLogin=false
						this.list=res.planList	
														
					}
				})
			},
			select(item){
				console.log(item)
				this.$tool.uniNavigateTo({
					url:`/pages/my/card-detail?id=${item.plan_id}`
				})
			}
		}
	}
</script>

<style scoped lang="less">
.card{
	.box{
		margin: 0rpx 40rpx 0 40rpx ;
		border-bottom: 1rpx solid #EFEFEF;
		height: 118px;
		padding: 20px 0;
		box-sizing: border-box;
		.left{
			width: 200rpx;
			height: 160rpx;
			border-radius: 10rpx;
			background: #999999;
			margin-right: 30rpx;
			flex-shrink: 0;
		}
		.right{		
			width: calc(100% - 200rpx);
			.title{
				font-size: 34rpx;
			}
			.info{
				font-size: 26rpx;
				margin: 10rpx 0;
				color: grey;
				img{
					display: none;
				}
			}				
			.num{
				font-size: 34rpx;					
				.price1{
					display: inline-block;
					margin-right: 40rpx;
					color: #FF9224;
				}
				.price2{
					text-decoration:line-through;
					color: #A6A6A6;
				}
			}
		}
	}
}
</style>
