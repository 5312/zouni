<template>
	<view>
		<view  class="canvas-box" @longpress='saveImg'>
			<canvas class="canvas"  canvas-id="shareImg" :style="{width: width +'px',height: height+'px',zIndex: 100}">
			</canvas>
		</view>
		<image v-if="imgUrl" class="img" :src="imgUrl" mode="aspectFit" show-menu-by-longpress='1' :style="{width: width +'px',height: height+'px'}"></image>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				width: null,
				height: null,
				bg: null,
				qr: null,
				bgPath: null,
				qrPath: null,
				num:null,
				imgUrl: null,//最终图片路径
			}
		},
		onLoad() {
			let _this = this;
			uni.getSystemInfo({
				success(res) {
					//console.log(res);
					_this.width = res.screenWidth;
					_this.height = res.windowHeight;
					_this.num = res.pixelRatio
				}
			});
			this.init().catch(err => {
				console.log('init()', err)
			}); //发起请求
		},
		methods: {
			async init() {
				let _this = this;
				let uid = this.$tool.uniGetStorage('userId'); //用户id
				let qr = await new Promise(function(resolve, reject) {
					_this.$tool.uniRequest({
						url: 'api/Codeok/',
						params: {
							uid: uid,
							tid: '10014'
						},
						success: function(res) {
							resolve(res);
						}
					})
				})
				this.qr = qr.sharimg; //二维码
				this.bg = qr.bjimg; //背景
				this.downFilePath().catch(err => {
					console.log('downFilePath()', err)
				}) //下载图片
			},
			async downFilePath() { //下载图片
				let _this = this;
				this.$tool.uniShowLoading({
					title: "加载中"
				})
				//下载二维码图片
				const qrCode = await new Promise(function(resolve, reject) {
					uni.downloadFile({
						url: _this.qr,
						success(res) {
							_this.qrPath = res.tempFilePath
							resolve(res);
						},
						fail(err) {
							reject(err);
							console.log(err, 'downqr')
						}
					})
				})
				//下载背景图片
				const bg = await new Promise(function(resolve, reject) {
					uni.downloadFile({
						url:_this.bg,
						success: result => {
							_this.bgPath = result.tempFilePath;
							resolve(result)
						},
						fail(err) {
							reject(err);
							console.log(err, 'getbg');
						}
					})
				}) 
				this.getImgInfo().catch(err => {
					console.log('getImgInfo', err)
				})
			},
			async getImgInfo() { //获取图片信息
				let _this = this;
				//二维码信息
				const qrInfo = await new Promise(function(resolve, reject) {
					uni.getImageInfo({
						src: _this.qrPath,
						success(res) {
							resolve(res);
						},
						fail(err) {
							reject(err)
						}
					})
				});
				
				//背景图片信息
				console.log(_this.bgPath)
				const bgInfo = await new Promise(function(resolve, reject) {
					uni.getImageInfo({
						src:_this.bgPath,
						success(res) {
							resolve(res);
						}
					})
				});
				this.create(bgInfo, qrInfo).catch(err => {
					console.log('create', err)
				})
			},
			async create(bg, qr) {
				let _this = this;
				/* const query = uni.createSelectorQuery();
				query.select('#shareImg')
				.fields({nede:true,size:true})
				.exec() */
				const ctx = uni.createCanvasContext('shareImg'); //canvas上下文
				//绘制背景图
				//二维码位置
				let x = this.width / 2 - qr.width/2;
				let y = this.height /2 - qr.height ;
				console.log(x,y)
				ctx.drawImage(bg.path, 0, 0, _this.width, _this.height);//背景
				ctx.drawImage(qr.path, x, y, 100, 100);//二维码
				ctx.draw()

				//生成图片
				setTimeout(function() {
					console.log('--createLoading')
					_this.$tool.uniHideLoading()
					uni.canvasToTempFilePath({
						canvasId: 'shareImg',
						width: _this.width,
						height: _this.height,
						destWidth: _this.width * _this.num,//图片模糊的处理办法*pixelRatio
						destHeight: _this.height * _this.num,
						success: function(res) {
							_this.imgUrl = res.tempFilePath;
						},
						fail(err) {
							console.log(err)
						}
					})
				}, 1000)
			},
			saveImg() {
				let that = this;
				/* wx.previewImage({
					current: that.imgUrl, // 当前显示图片的http链接
					urls: [that.imgUrl], // 需要预览的图片http链接列表
					indicator:'none',
					longPressActions: {
						itemList: ['发送给朋友', '保存图片', '收藏'],
						success: function(data) {
							console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
						},
						fail: function(err) {
							console.log(err.errMsg);
						}
					}
				}) */
				/* uni.saveImageToPhotosAlbum({
					filePath:that.imgUrl,
					success(res) {
						uni.showModal({
							title:'保存成功',
							content:'图片成功保存到相册了，快去分享给朋友吧',
							showCancel:false,
							confirmText:'好的',
							success(res) {
								
							}
						})
					}
				}) */
			}
		}
	}
</script>

<style scoped>
	.canvas{
		position: fixed;
		left:100%; 
	}
	.img{
		width:100%;
	}
</style>
