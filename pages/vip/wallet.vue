<template>
	<view class="wallet bg-page h100">
		<NoDate v-if="isNoDate"></NoDate>
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
				isNoDate:true
			}
		}
	}
</script>

<style scoped lang="less">

</style>
