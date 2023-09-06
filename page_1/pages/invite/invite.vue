<template>
	<view class="page">
		<view class="statics flex align-center">
			<view class="statics-item">
				<navigator url="/page_1/pages/invite/invite_num">
					<view class="text-gray">已推荐人数</view>
					<view class="statics-item-number">{{user.invite_count||0}}</view>
				</navigator>
			</view>

			<view class="statics-item" @click="withdraw" v-if="false">
				<view class="text-gray">已奖励提成</view>
				<view class="statics-item-number">--</view>
			</view>

		</view>
		<!-- #ifdef MP-WEIXIN -->
		<view class="save-button">长按下方图片，分享给好友或朋友圈</view>
		<!-- #endif -->
		<!-- #ifndef MP-WEIXIN -->
		<view class="save-button" @click="copyShareUrl">复制链接分享给好友</view>
		<view class="text-center margin-top"><text class="highlight">长按下方图片保存到相册，分享图片给好友或朋友圈</text></view>
		<!-- #endif -->

		<view class="text-center margin-top">好友注册后，可获得<text
				class="highlight">{{configs.shareAppNumber}}</text>次对话次数</view>
		<view class="text-center margin-top-sm" v-if="configs.ai_chat_fee_rate">好友充值购买后，可获得<text
				class="highlight">{{(configs.ai_chat_fee_rate||0.1)*100}}%</text>佣金提成</view>

		<view class="img-card">
			<image @click="previewImage" mode="widthFix" style="width:100%;margin: 0 auto;" :src="shareImage"></image>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				user: {},
				inviteCode: '',
				shareImage: '',
				configs: {},
			}
		},
		onShareAppMessage: function() {
			let user = this.uni_getStorageSync('user');
			let that = this

			this.$commonApi.addNumber({
				openid: user.openid,
				number: this.$commonApi.configs.shareAppNumber || 1
			}).then((resuls) => {
				console.log(resuls);
			})

			return {
				title: this.$commonApi.getShareTitle(),
				path: this.$commonApi.homePage() + '?type=haoyou&inviteCode=' + user.my_invite_code
			};
		},
		onShareTimeline: function() {
			let user = this.uni_getStorageSync('user');
			let that = this

			this.$commonApi.addNumber({
				openid: user.openid,
				number: this.$commonApi.configs.shareAppNumber || 1
			}).then((resuls) => {
				console.log(resuls);
			})
			return {
				title: this.$commonApi.getShareTitle() + ' 你也来试试吧',
				path: this.$commonApi.homePage() + '?type=pengyouquan&inviteCode=' + user.my_invite_code
			};
		},

		onShow() {
			this.$commonApi.is_login()
		},
		onLoad(options) {
			this.configs = this.$commonApi.configs
			this.getShareImg()
		},
		methods: {
			withdraw() {
				uni.showToast({
					title: '提现功能开发中'
				})
			},
			copyShareUrl() {
				this.$commonApi.shareResisterUrl()
			},
			async getShareImg() {
				let that = this
				this.user = this.uni_getStorageSync('user');
				let text =  this.user.username || this.user.nickname
				//处理多账号时图片缓存问题
				let cache_key = 'shareImage' + this.user.uid+ text + '_v10'
				let tmp_img = this.uni_getStorageSync(cache_key)
				if (tmp_img) {
					this.shareImage = tmp_img
					return
				}
				let codeHost = this.$commonApi.configs.serverHost
				let shareHaibaoImage = this.$commonApi.configs.haibaoShareImage
				
				// #ifdef MP-WEIXIN
				//小程序二维码
				this.$commonApi.user({
					action: 'getUnlimitedQRCode',
					params: {
						page:'pages/home/home',
						scene:'inviteCode='+this.$commonApi.get_my_share_invite_code()
					}
				}).then((res) => {
					console.log(res)
					if(res.code==0){
						that.shareImage = res.msg.data
						that.uni_setStorageSync(cache_key, that.shareImage)
						return 
					}
					if (shareHaibaoImage) {
						this.shareImage = shareHaibaoImage
						return
					} 
				})
				return 
				// #endif
				
				
				// #ifndef H5
				//非H5分享图
				if (shareHaibaoImage) {
					this.shareImage = shareHaibaoImage
					return
				} else {
					return
				}

				if (!codeHost && shareHaibaoImage) {
					this.shareImage = shareHaibaoImage
					return
				}

				// #endif
				if (!codeHost) {

					return
				}

				text = text || ''
				let url = this.$commonApi.getShareRegUrl()
				if (!url) {
					return
				}
				url = encodeURIComponent(url)
				text = encodeURIComponent(text)
				let imgUrl = codeHost + '/qrcode/index.php?text=' + text + '&url=' + url
				that.$commonApi.callFunctionAsync('ai-chat-file-down',
				{
					url:imgUrl,
					method:'GET',
					dataType:'text',
				}).then((res)=>{
					console.log(res)
					if(!res.result){
						return 
					}
					that.shareImage = res.result
					that.uni_setStorageSync(cache_key, that.shareImage)
				}).catch((err)=>{
					console.log(err)
				})
				 

			},

			//长按识别二维码
			previewImage(e) {
				let url = this.shareImage
				uni.previewImage({
					// 需要预览的图片链接列表。若无需预览，可以注释urls
					urls: [url],
					// 为当前显示图片的链接/索引值
					current: url,
					// 图片指示器样式	
					indicator: 'default',
					// 是否可循环预览
					loop: false,
					// 长按图片显示操作菜单，如不填默认为保存相册
					longPressActions: {
						itemList: ['发送给朋友', '保存图片', '收藏'],
					},
					success: res => {},
					fail: err => {}
				});
			},

		}
	}
</script>

<style lang="scss" scoped>
	.page {
		padding: 0 22px;
		padding-bottom: calc(44px + env(safe-area-inset-bottom));
		position: relative;
		background-color: var(--global-bg-color);
	}

	.page * {
		color: var(--global-font-color);
	}

	.page .statics {
		padding: 33px 0;
	}

	.align-center {
		align-items: center;
	}

	.flex {
		display: flex;
	}

	.page .statics .statics-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 13px;
	}

	.text-gray,
	.line-gray,
	.lines-gray {
		color: var(--global-font-color);
	}

	.page .statics .statics-item .statics-item-number {
		margin-top: 16px;
		font-size: 28px;
		color: var(--global-font-color);
		text-align: center;
	}

	.page .save-button {
		background-color: $btn-color-primary;
		color: #fff;
		border-radius: 26px;
		margin: 0 27px;
		height: 41px;
		line-height: 41px;
		text-align: center;
	}

	.text-center {
		text-align: center;
	}

	.margin-top {
		margin-top: 16px;
	}

	.text-center {
		text-align: center;
	}

	.page .highlight {
		color: red;
		padding: 0 5px;
	}

	.page .img-card {
		margin-top: 22px;
		background-color: #fff;
		border-radius: 8px;
		padding: 16px;
		box-shadow: 0 0 22px 0 hsla(0, 0%, 39.2%, .1);
	}

	.page .img-card image {
		width: 100%;
		margin: 0 auto;
		border-radius: 8px;
	}
</style>