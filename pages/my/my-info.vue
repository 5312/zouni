<template>
	<view class="my-info" v-if="userInfo">
		<view class="line flex a-center j-between flex-row" @click="changeAvatar">
			<view class="left">个人头像</view>
			<view class="right flex a-center j-end flex-row">
				<image :src="userInfo.avatarUrl" class="avatar"></image>
				<image src="../../static/image/show1.png" class="icon"></image>
			</view>
		</view>
		<view class="line flex a-center j-between flex-row" @click="editPage(userInfo.nickName, 'nickName')">
			<view class="left">姓名</view>
			<view class="right flex a-center j-end flex-row">
				<text class="user-name">{{ userInfo.nickName }}</text>
				<image src="../../static/image/show1.png" class="icon"></image>
			</view>
		</view>
		<view class="line flex a-center j-between flex-row">
			<view class="left">性别</view>
			<view class="right flex a-center j-end flex-row">
				 <view class="flex a-center j-end flex-row">
					  <switch class='orange switch-sex' @change="sexValChange" :class="sexVal===1?'checked':''" :checked="sexVal===1?true:false"></switch> 
				</view>
			</view>
		</view>
		<view class="line flex a-center j-between flex-row" @click="editPage(userInfo.tel, 'tel')">
			<view class="left">手机号</view>
			<view class="right flex a-center j-end flex-row">
				<text class="phone">{{ userInfo.tel }}</text>
				<image src="../../static/image/show1.png" class="icon"></image>
			</view>
		</view>
		<!-- <view class="line flex a-center j-between flex-row">
			<view class="left">手机号</view>
			<view v-show="phoneButton" class=" right flex a-center j-end flex-row">
				<button class="btns" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">获取电话号码</button>
			</view>
			<view v-show="phoneInput" class="right flex a-center j-end flex-row" @click="editPage(userInfo.tel, 'tel')">
				<text class="phone">{{ phone }}</text>
				<image src="../../static/image/show1.png" class="icon"></image>
			</view>
		</view> -->
		<!--  -->
		<view class="line flex a-center j-between flex-row">
			<view class="left">出生日期</view>
			<view class="right flex a-center j-end flex-row">
				<picker mode="date" :value="userInfo.birthday" :start="startDate" :end="endDate" @change="bindDateChange">
					<view class="uni-input">{{ userInfo.birthday || '2020-07-10' }}</view>
				</picker>
				<image src="../../static/image/show1.png" class="icon"></image>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: null,
			sexVal: null,
			phone: null
		};
	},
	onLoad(option) {
		this.getMyInfo();
		console.log(this.phone);
	},
	computed: {
		startDate() {
			return this.getDate('start');
		},
		endDate() {
			return this.getDate('end');
		},
		phoneButton() {
			if (!this.phone) {
				return;
			}
			if (this.phone.length >= 11) {
				return false;
			} else {
				return true;
			}
		},
		phoneInput() {
			if (!this.phone) {
				return;
			}
			if (this.phone.length >= 11) {
				return true;
			} else {
				return false;
			}
		}
	},
	methods: {
		bindDateChange: function(e) {
			this.editUserInfo({
				birthday: e.target.value
			});
		},
		apiFunc(e){
			let pThis = this;
			this.$api.myInfo_getPhone({
				sessionKey:pThis.$cache.get('_session_key'),
				iv: e.detail.iv,
				encrypted_data: e.detail.encryptedData
			}).then(res => {
				console.log(res);
				pThis.phone = res.phoneNumber;
				pThis.userInfo.tel = pThis.phone;
				//pThis.setPhone('tel', pThis.phone);
			});
		},
		getPhoneNumber(e) {
			let pThis = this;
			if (e.detail.errMsg == 'getPhoneNumber:ok') {
				//校验是否过期
				wx.checkSession({
					success: function() {
						// session_key 未过期，并且在本生命周期一直有效
						pThis.apiFunc(e)
					},
					fail: function() {
						// session_key 已经失效，需要重新执行登录流程
						pThis.$tool.getTokenValue({
							success: () => {
								pThis.apiFunc(e)
							},
							complete: () => {}
						});
					}
				});
			} else {
				this.$tool.uniShowToast({
					title: '获取失败！',
					icon: 'none'
				});
				return false;
			}
		},
		setPhone(type = 'tel', phone) {
			let _this = this;
			this.$tool.uniRequest({
				url: `/api/user/edit`,
				method: 'POST',
				params: {
					avatarUrl: _this.userInfo.avatarUrl,
					tel: _this.type === 'tel' ? phone : _this.userInfo.tel,
					gender: _this.userInfo.gender,
					birthday: _this.userInfo.birthday
				},
				success: res => {
					_this.$tool.uniShowToast({
						title: '修改成功！'
					});
					_this.$cache.set('_isEditUserInfo', true);
				}
			});
		},
		sexValChange(e) {
			e.detail.value?this.sexVal = 1:this.sexVal = 2;
			this.editUserInfo({});
		},
		getDate(type) {
			const date = new Date();
			let year = date.getFullYear();
			let month = date.getMonth() + 1;
			let day = date.getDate();

			if (type === 'start') {
				year = year - 60;
			} else if (type === 'end') {
				year = year + 2;
			}
			month = month > 9 ? month : '0' + month;
			day = day > 9 ? day : '0' + day;
			return `${year}-${month}-${day}`;
		},
		editPage(value, type) {
			uni.redirectTo({
				url: `/pages/base/edit-my-info?value=${value}&type=${type}&userInfo=${JSON.stringify(this.userInfo)}`
			});
		},
		base64PageImg(url) {
			let base64Img = uni.getFileSystemManager().readFileSync(url, 'base64'); //转码
			return 'data:image/png;base64,' + base64Img; //拼接后返回
		},
		changeAvatar() {
			let _this = this;
			uni.chooseImage({
				count: 1, //默认9
				sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
				success: function(res) {
					let url = res.tempFilePaths[0];
					// _this.userInfo.avatarUrl=_this.base64PageImg(url)
					_this.editUserInfo({
						avatarUrl: _this.base64PageImg(url)
					});
				}
			});
		},
		editUserInfo(options) {
			let { avatarUrl, birthday } = options;
			let _this = this;
			this.$tool.uniRequest({
				url: `/api/user/edit`,
				method: 'POST',
				params: {
					avatarUrl: avatarUrl || _this.userInfo.avatarUrl,
					tel: _this.userInfo.tel,
					nickName: _this.userInfo.nickName,
					gender: String(_this.sexVal),
					birthday: birthday || _this.userInfo.birthday
				},
				success: res => {
					_this.$cache.set('_isEditUserInfo', true);
					_this.getMyInfo();
				}
			});
		},
		getMyInfo() {
			let _this = this;
			this.$tool.uniRequest({
				url: `/api/user.index/detail`,
				success: res => {
					_this.userInfo = res.userInfo;
					_this.sexVal = res.userInfo.gender === '男' ? 1 : 2;
					_this.userInfo.gender = _this.sexVal;
					_this.phone = res.userInfo.tel;
				}
			});
		}
	}
};
</script>

<style scoped lang="less">
.my-info {
	padding: 0 40rpx;

	.btn {
		height: 80rpx;
		border-radius: 8rpx;
		background: #ff8d1a;
		line-height: 80rpx;
		text-align: center;
		color: white;
		margin-top: 120rpx;
	}

	.line {
		height: 120rpx;
		border-bottom: 2rpx solid #efefef;

		.left {
			font-size: 30rpx;
		}

		.right {
			font-size: 26rpx;
			color: #505050;

			.btns {
				font-size: 26rpx;
				height: 80rpx;
				border-radius: 8rpx;
				background: #ff8d1a;
				line-height: 80rpx;
				text-align: center;
				color: white;
			}

			.avatar {
				width: 66rpx;
				height: 66rpx;
				border-radius: 50%;
			}

			.icon {
				width: 30rpx;
				height: 30rpx;
				margin-left: 16rpx;
			}
		}

		.checkBox1 {
			margin-left: 30rpx;
		}

		.checkBox {
			display: inline-block;
			width: 32rpx;
			height: 32rpx;
			border-radius: 50%;
			border: 2rpx solid #ff8f1e;
			margin-right: 10rpx;
			position: relative;
		}

		.checkBox.isChecked::after {
			content: '';
			width: 20rpx;
			height: 20rpx;
			border-radius: 50%;
			background: #ff8f1e;
			position: absolute;
			top: 5rpx;
			left: 5rpx;
		}
	}
}
</style>
