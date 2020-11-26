<template>
	<view class="add-car">
		<view class="wrap">
			<view class="input-wrap">
				<!-- <input type="text" v-model.trim="licensePlateVal" placeholder="请输入新增车牌号"
				@focus="carInputClick"	class="input" :maxlength="20"/> -->
				<view class="input"  @click="carInputClick">{{licensePlateVal || '请输入新增车牌号'}}</view>
			</view>
			<view class="btn-wrap">
				<view class="btn" @click="save">{{status=='add'?'添加车辆':'修改车辆'}}</view>
			</view>
		</view>
		<plate-number ref="plate" v-model="licensePlateVal"></plate-number>
	</view>
</template>
<!-- 编辑添加车牌号页面 -->
<script>
	import plateNumber from '@/components/plate-number/plateNumber.vue';
	export default{
		components: {plateNumber},
		data(){
			return{
				licensePlateVal:"",
				siteId:null,
				pageForm:'',
				status:"add",
				detail:null
			}
		},
		onLoad(option){
			this.siteId=option.siteId?option.siteId:null
			this.pageForm=option.pageForm
			this.status=option.status
			if(this.pageForm==='car' && this.status==='edit'){
				this.detail=option.detail?JSON.parse(option.detail):null
				this.licensePlateVal=this.detail?this.detail.detail:""
			}
			if(this.status==='add'){
				this.$tool.nuiSetNavigationBarTitle('添加车辆')
			}else{
				this.$tool.nuiSetNavigationBarTitle('修改车辆')
			}
		},
		methods:{  
			carInputClick() {
				this.$refs.plate.show();
			},
			async save(){		
				if(!this.licensePlateVal){
					this.$tool.uniShowToast({
						title:"请输入车牌号",
						icon: "none"
					})
					return
				}
				this.$refs.plate.close();
				let _this=this
				let url=''
				let params={
					detail:this.licensePlateVal,  //车牌号
					region:""
				};
				if(this.status==='add'){
					url=`/api/address/add`
				}else{
					url=`/api/address/edit`
					params.address_id=this.detail.address_id
				}
				const res = await this.$api.addCar(url,params);
				if(this.pageForm==='scan'){
					this.$tool.uniRedirectTo({
						url:`/pages/scan/index?siteId=${this.siteId}&fromPage=addCar`
					})				
				}else if(this.pageForm==='car'){
					this.$tool.uniReLaunch({
						url:'/pages/my/my-car'
					})
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.add-car{
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
