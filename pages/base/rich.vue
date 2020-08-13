<template>
	<view class="rich">
		<rich-text :nodes="detail"></rich-text>
		<NoDate v-if="isNoDate"></NoDate>
	</view>
</template>

<script>
	import NoDate from "../../components/base/no-data.vue"
	export default {
		components: {
			NoDate
		},
		data() {
			return {
				isNoDate: false,
				fromPage: "",
				detail: ""
			}
		},
		onLoad(options) {
			this.fromPage = options && options.fromPage ? options.fromPage : ''
			if (this.fromPage === 'agreement') {
				let id = options.id
				this.getDetail(id, 'helpdetail', true)
			} else if (this.fromPage === 'about') {
				this.$tool.nuiSetNavigationBarTitle('关于我们')
				this.getDetail(10008, 'aboutdetail', false)
			} else if (this.fromPage === 'registrationAgreement') {
				this.$tool.nuiSetNavigationBarTitle('注册协议')
				this.getDetail(10006, 'aboutdetail', false)
			} else if (this.fromPage === 'serviceAgreement') {
				this.$tool.nuiSetNavigationBarTitle('服务协议')
				this.getDetail(10007, 'aboutdetail', false)
			} else if (this.fromPage === 'help') {
				let id = options.id
				this.getDetail(id, 'helpdetail', true)
			}
		},
		props: {
			protocol: {
				type: String,
				default: ""
			}
		},
		methods: {
			getDetail(id, urlVal, isSetTitle = false) {
				this.$tool.uniRequest({
					url: `/api/wxapp/${urlVal}&help_id=${id}`,
					success: (res) => {
						console.log(res.detail.content)
						this.detail = res.detail && res.detail.content ? this.$tool.htmlre(res.detail.content) : ''
						console.log(this.detail)
						this.detail=this.$tool.formatRichText(this.detail)
						console.log(this.detail)
						this.isNoDate = this.detail ? false : true
						isSetTitle ? this.$tool.nuiSetNavigationBarTitle(res.detail.title) : false
					}
				})
			},
			
		}
	}
</script>

<style scoped lang="less">
	.rich {
		padding: 40rpx;
		font-size: 30rpx;
	}
</style>
