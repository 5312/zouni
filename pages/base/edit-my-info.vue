<template>
	<view class="edit-my-info">
		<view class="wrap">
			<view class="input-wrap">
				<input type="text" v-model.trim="inputVal" placeholder="请输入内容"
					class="input" :maxlength="20"/>
			</view>
			<view class="btn-wrap">
				<view class="btn" @click="sure">确定</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		data(){
			return{
				inputVal:"",
				type:'',
				userInfo:null,
				sexVal:null
			}
		},
		onLoad(option){
			this.inputVal=option.value
			this.type=option.type
			this.userInfo=JSON.parse(option.userInfo)
		},
		methods:{  
			sure(){		
				if(!this.inputVal){
					this.$tool.uniShowToast({
						title:"请输入内容",
						icon: "none"
					})
					return
				}
				let _this= this
				this.$tool.uniRequest({
					url: `/api/user/edit`,			
					method: 'POST',
					params:{
						avatarUrl:_this.userInfo.avatarUrl,
						tel:_this.type==='tel'?_this.inputVal:_this.userInfo.tel,
						nickName:_this.type==='nickName'?_this.inputVal:_this.userInfo.nickName,
						gender:_this.userInfo.gender,
						birthday:_this.userInfo.birthday
					},
					success: (res) => {
						_this.$tool.uniShowToast({
							title: "修改成功！"						
						})
						_this.$tool.uniSetStorage('isEditUserInfo',true)
						setTimeout(()=>{
							uni.navigateBack({
								delta: 1
							})
						},1000)
					}
				})
				
			}	
		}
	}
</script>

<style lang="less" scoped>
	.edit-my-info{
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background: white;	
		.wrap{
			padding: 40rpx;
		}
		.title{
			color: black;
			line-height: 2;
			font-size: 36rpx;
		}
		.input-wrap{
			margin-bottom: 40rpx;
			margin-top: 10rpx;
			.input{
				font-size: 30rpx;
				height: 80rpx;
				line-height: 80rpx;
				border: 1rpx solid #FF8D1A;
				padding-left: 20rpx;
				border-radius: 10rpx;
			}
		}
		.btn-wrap{
			.btn{
				background: #FF8D1A;
				color: white;
				text-align: center;
				height: 80rpx;
				line-height: 80rpx;
				font-size: 32rpx;
				border-radius: 8rpx;
			}
		}
	}
</style>
