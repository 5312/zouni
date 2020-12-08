<template>
	<view class="help bg-page h100">
		<view class="content" v-if="list.length > 0">
			<view class="header">常见问题</view>
			<u-collapse :item-style="itemStyle">
				<u-collapse-item  :title="item.title" v-for="(item, index) in list" :key="index">
					<view class="con">{{ item.content}}</view>
				</u-collapse-item>
			</u-collapse>
		</view>
		<NoDate v-else></NoDate>
	</view>
</template>

<script>
import NoDate from '../../components/base/no-data.vue';
export default {
	components: {
		NoDate
	},
	data() {
		return {
			isNoDate: false,
			list: [],
			itemStyle:{
				padding:'10rpx 20rpx',
				borderBottom:'2rpx solid #efefef'
			}
		};
	},
	created() {
		this.init();
	},
	methods: {
		init() {
			this.getHelpList();
		},
		async getHelpList() {
			const result = await this.$api.help();
			this.list = result.data.list;
		},
		async getDetail(id) {
			const result = await this.$api.richGetDetail('helpdetail',id);
		},
	}
};
</script>

<style scoped lang="less">
.help {
	.content{
		.con{
			padding:20rpx;
		}
	}
	.header {
		height: 80rpx;
		line-height: 80rpx;
		padding: 0 20rpx;
		color: #999999;
		font-size: 24rpx;
		border-bottom: 2rpx solid #efefef;
	}
	.list {
		border-bottom: 2rpx solid #efefef;
		.line {
			margin: 0 20rpx;
			height: 88rpx;
			&:not(:last-child) {
				border-bottom: 2rpx solid #efefef;
			}
			.left {
				font-size: 28rpx;
			}
			.right {
				.show-icon {
					width: 30rpx;
					height: 30rpx;
				}
			}
		}
	}
}
</style>
