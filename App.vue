<script>
	
	export default {
		onLaunch: function() {
			
		},		
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},	
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import url("@/common/css/reset.css");
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "uview-ui/index.scss";
</style>
