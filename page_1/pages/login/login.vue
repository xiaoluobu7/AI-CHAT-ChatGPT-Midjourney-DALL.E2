<template>
	<view class="zai-box">
		<!-- #ifdef MP-WEIXIN -->
		<!-- 微信一键登录 -->
		<view class="form">
			<view class="logo">
				<u--image :src="ai_chat_mp_logo" shape="circle" width="200rpx" height="200rpx">
				</u--image>
			</view>
			<u-transition :show="true" mode="slide-left">
				<view class="title">{{ai_chat_login_page_title}}</view>
			</u-transition>
			<u-transition :show="true" mode="slide-right">
				<view class="desc">{{ai_chat_login_page_desc}}</view>
			</u-transition>

			<view class="btn-group">
				<view class="btn" v-on:click="login">
					<u-button shape="circle" iconColor="#ffffff" class="primary-color" color="#686efe" icon="edit-pen"
						text="微信一键登录">
					</u-button>
				</view>
				<view class="btn">
					<u-button shape="circle" class="primary-color" color="#686efe" :plain="true" open-type="share"
						icon="share" text="推荐给朋友">
					</u-button>
				</view>
			</view>
		</view>
		<!-- #endif -->

		<!-- 非微信小程序客户端 -->
		<!-- #ifndef MP-WEIXIN -->
		<view id="wx_browser" v-if="is_weixin_brwser">
			<image v-if="false" src="/static/zaizai-login/login.png" mode='aspectFit' class="zai-logo"></image>
			<view class="zai-title">授权登录</view>
			<view class="zai-form">
				<button class="zai-btn" @click="getWxUserInfoCode(false,true)">微信网页登录</button>
			</view>
		</view>

		<view id="other_browser" v-if="!is_weixin_brwser">
			<image v-if="false" src="/static/zaizai-login/login.png" mode='aspectFit' class="zai-logo"></image>
			<view class="zai-title">登录账号</view>
			<view class="zai-form">
				<input class="zai-input" v-model="username" placeholder="请输入用户名" />
				<input class="zai-input" v-model="password" password placeholder="请输入密码" />
				<view class="zai-label"></view>
				<button class="zai-btn" @click="login">立即登录</button>

				<navigator v-if="is_register || !configs.is_not_open_register" :url="registerUrl" hover-class="none"
					class="zai-label">还没有账号？点此注册.</navigator>
				<button style="margin-top: 10px; background-color:coral;" @click="previewImage(configs.ai_chat_wx_qr_code)"
					v-if="!is_register&&configs.is_not_open_register" class="zai-btn">联系客服，获取使用账号</button>


			</view>
		</view>

		<!-- #endif -->
	</view>
</template>

<script>
	import requestTool from '@/common/requestTool.js'
	export default {
		data() {
			return {
				username: '',
				password: '',
				needPermission: false,
				ai_chat_login_page_title: '',
				ai_chat_login_page_desc: '',
				ai_chat_mp_logo: '',
				registerUrl: '/page_1/pages/register/register',
				inviteCode: '',
				is_weixin_brwser: false,
				wx_code: '', //授权登录code
				configs: {},
				is_register: false
			}
		},
		onShow() {
			//如果已经登录，则返回首页
			let flag = this.isLogined()
			if (flag) {
				return
			}
			this.configs = this.$commonApi.configs
			// #ifdef H5
			//当前页面才生效
			if (this.$commonApi.isInCurrentPage('login/login')) {
				document.onkeydown = event => {
					var e = event || window.event;
					if (e && e.keyCode == 13) { //回车键的键值为13
						this.login()
					}
				};
			}
			// #endif
		},


		async onLoad(options) {
			await this.$commonApi.get_ai_chat_configs()
			this.configs = this.$commonApi.configs
			this.is_register = options.is_register || false

			//如果已经登录，则返回首页
			let flag = this.isLogined()
			if (flag) {
				return
			}

			//5.22新的授权登录
			// #ifndef MP-WEIXIN
			if (this.$commonApi.configs.is_use_uni_login_page) {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
				})
				return
			}
			// #endif
			await this.$commonApi.get_ai_chat_configs()
			this.$commonApi.autoAuthLogin()

			let that = this
			this.$commonApi.save_share_invite_code(options.inviteCode || '')
			this.inviteCode = options.inviteCode || (this.uni_getStorageSync('inviteCode'))

			that.ai_chat_login_page_title = that.$commonApi.ai_chat_login_page_title
			that.ai_chat_login_page_desc = that.$commonApi.ai_chat_login_page_desc
			that.ai_chat_mp_logo = that.$commonApi.ai_chat_mp_logo

			that.$commonApi.get_ai_chat_configs().then((res) => {
				that.uni_setStorageSync('ai_chat_config', res)
				that.$commonApi.reLoadConfig()
				that.ai_chat_login_page_title = that.$commonApi.ai_chat_login_page_title
				that.ai_chat_login_page_desc = that.$commonApi.ai_chat_login_page_desc
				that.ai_chat_mp_logo = that.$commonApi.ai_chat_mp_logo
				that.configs = that.$commonApi.configs
			})

			switch (this.$commonApi.configs.ai_chat_register_type) {
				case 'username':
					this.registerUrl = '../register/register'
					break;
				case 'email':
					this.registerUrl = '../register/email'
					break;
				case 'mobile':
					this.registerUrl = '../register/mobile'
					break;
			}

			if (this.is_register) {
				this.registerUrl += '?is_register=1'
			}

			// #ifdef MP-WEIXIN

			// 在页面中定义插屏广告
			let interstitialAd = null

			// 在页面onLoad回调事件中创建插屏广告实例
			if (wx.createInterstitialAd && this.$commonApi.ai_chat_ad_id_insert) {
				let tmp_ai_chat_ad_id_insert = this.$commonApi.ai_chat_ad_id_insert
				//插屏广告
				interstitialAd = wx.createInterstitialAd({
					adUnitId: tmp_ai_chat_ad_id_insert
				})
				if (interstitialAd) {
					interstitialAd.onLoad(() => {})
					interstitialAd.onError((err) => {})
					interstitialAd.onClose(() => {})
				}
			}

			// 在适合的场景显示插屏广告
			if (interstitialAd) {
				interstitialAd.show().catch((err) => {
					console.error(err)
				})
			}

			// #endif


		},
		// #ifdef MP-WEIXIN
		onShareAppMessage: function() {
			return {
				title: this.$commonApi.getShareTitle(),
				path: '/page_1/pages/login/login?type=haoyou',
				success: function(e) {}
			};
		},
		onShareTimeline: function() {
			return {
				title: this.$commonApi.getShareTitle(),
				path: '/page_1/pages/login/login?type=pengyouquan',
				success: function(e) {}
			};
		},
		// #endif

		methods: {
			//长按识别二维码
			previewImage(url) {
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
					success: res => {
						console.log('previewImage res', res);
					},
					fail: err => {
						console.log('previewImage err', err);
					}
				});
			},
			isLogined() {
				//加载最新配置
				let user = this.uni_getStorageSync('user_token');
				if (user) {
					// #ifdef H5
					//微信H5，需要判断是否已经获取openid
					let openid = this.uni_getStorageSync('openid');
					var ua = navigator.userAgent.toLowerCase();
					if (ua.match(/MicroMessenger/i) == "micromessenger" && !openid) {
						//没有使用openid授权登录
						return false
					}
					// #endif
					this.$commonApi.toHomePage()
					return true
				}

				// #ifdef H5
				let that = this
				let is_login = this.$commonApi.is_login(true);
				if (is_login) {
					//已经登录
					return
				}
				let mpurl = this.$commonApi.configs.mpurl; //公众号回调php api 5.10
				if (mpurl && this.$commonApi.configs.ai_chat_pub_acc_oauth_back_url && this.$commonApi.configs.ai_chat_pub_acc_app_secret) {
					var ua = navigator.userAgent.toLowerCase();
					if (!this.$commonApi.configs.allow_password_login && !
						/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(ua)) {
						//返回首页走扫码登录
						uni.showToast({
							title: '请微信扫码登录'
						})
						this.$commonApi.toHomePage()
					}
				}
				// #endif

				return false
			},
			// #ifdef H5
			loginByCode() {
				//以获取的openid
				let code = this.wx_code
				this.$commonApi.user({
					action: 'loginByCode',
					params: {
						code: code,
						inviteCode: this.inviteCode
					}
				}).then((res) => {
					if (res.code != 0) {
						//this.$commonApi.show(res.msg)
						//刷新获取code
						if (res.code == 40029) {
							//过期code，自动刷新
							this.getWxUserInfoCode(false, true)
							return
						}
						//不自动刷新
						uni.showModal({
							title: '请重新手动授权',
							content: '授权异常code:' + res.code + ',原因:' + res.msg,
							success: (r) => {
								if (r.confirm) {
									that.getWxUserInfoCode(false, true)
								}
							}
						})
					} else {
						// 登陆成功
						//console.log(res)
						// 储存token?
						this.uni_setStorageSync('openid', res.openid)
						this.uni_setStorageSync('user_token', res.token)
						this.uni_setStorageSync('user_token_expired', res.tokenExpired)
						this.uni_setStorageSync('user', res)
						// 登录成功进行跳转
						this.$commonApi.toHomePage()
					}
				}).catch((err) => {
					this.$commonApi.show(err.msg)
				})

			},
			getWxUserInfoCode(isClickLogin, isGetCode) {
				//获取当前页面的url
				//如果报错 40163 这个错误吗是授权的code使用过或者过期 重新获取授权就可以了
				let appid = this.$commonApi.ai_chat_pub_acc_appid; //公众号或小程序id
				let uri = this.$commonApi.ai_chat_pub_acc_oauth_back_url; //就是用户授权后返回来的地址
				if (!uri || !uri.startsWith('http')) {
					// uni.showToast({
					// 	title:'没有配置公众号跳转连接',
					// 	icon:"none"
					// })
					console.log('没有配置公众号跳转连接')
					return
				}

				let link = window.location.href;
				let code = null; //授权获取的code,用它查询用户基本信息
				//url编码
				if (uri.indexOf('/#/') > -1) {
					url += '?auth=1'
				}
				uri = encodeURIComponent(uri)
				// 判断link中有没有code=字符串，
				if (link.indexOf('code=') === -1 || isGetCode) {
					//没有code= 发请求
					window.location.href = this.$commonApi.wx_auth_login_url()
				} else if (isClickLogin) {
					//回调函数已经执行 返回的链接存在code= 地址解析
					let temp = link.split("code=")[1];
					code = temp.split("&")[0];
					this.wx_code = code
					this.loginByCode()
					return
					//end 
				}
			},
			// #endif

			getWeixinCode() {
				return new Promise((resolve, reject) => {
					// #ifdef MP-WEIXIN
					uni.login({
						provider: 'weixin',
						success(res) {
							resolve(res.code)
						},
						fail(err) {
							reject(new Error('微信登录失败'))
						}
					})
					// #endif
				})
			},

			async getTemplateList() {
				let data = await this.$commonApi.callFunctionAsync('ai-chat-template')
				data.result = this.$commonApi.aes_decrypt_api_data(data.result)
				this.uni_setStorageSync('ai_chat_template', data.result)

			},

			login() {
				// #ifdef MP-WEIXIN
				uni.showLoading({
					mask: true,
					title: '正在登录中'
				})
				this.getWeixinCode().then((code) => {
					console.log('getWeixinCode')
					console.log(code)
					return this.$commonApi.user({
						action: 'loginByWeixin',
						params: {
							code,
							inviteCode: this.inviteCode
						},
					})
				}).then((res) => {
					uni.hideLoading()
					if (res.code != 0) {
						this.$commonApi.show(res.msg)
					} else {
						// 登陆成功
						// 储存token?
						//console.log(res);
						this.uni_setStorageSync('openid', res.openid)
						this.uni_setStorageSync('user_token', res.token)
						this.uni_setStorageSync('user_token_expired', res.tokenExpired)
						this.uni_setStorageSync('user', res)
						// 登录成功进行跳转
						this.$commonApi.toHomePage()
					}
				}).catch((e) => {
					uni.hideLoading()
					console.error(e)
					uni.showModal({
						showCancel: false,
						content: '微信登录失败，请稍后再试'
					})
				})
				// #endif


				// #ifdef H5 || APP || MP-TOUTIAO || MP-ALIPAY
				if (!this.username) {
					this.$commonApi.show('请输入用户名')
					return
				}
				if (!this.password) {
					this.$commonApi.show('请输入密码')
					return
				}

				this.$commonApi.user({
					action: 'login',
					params: {
						username: this.username,
						password: this.password,
						needPermission: this.needPermission
					}
				}).then((res) => {
					if (res.code != 0) {
						this.$commonApi.show(res.msg)
					} else {
						// 登陆成功
						// 储存token?
						this.uni_setStorageSync('openid', res.openid || '')
						this.uni_setStorageSync('user_token', res.token)
						this.uni_setStorageSync('user_token_expired', res.tokenExpired)
						this.uni_setStorageSync('user', res)
						// 登录成功进行跳转
						this.$commonApi.toHomePage()
					}
					// 
				}).catch((err) => {
					this.$commonApi.show(err.msg)
				})
				// #endif

			},
		}
	}
</script>

<style scoped lang="scss">
	.zai-box {
		padding: 0 100upx;
		position: relative;
	}

	.zai-logo {
		width: 100%;
		width: 100%;
		height: 310upx;
	}

	.zai-title {
		//position: absolute;
		top: 0;
		line-height: 360upx;
		font-size: 68upx;
		color: var(--global-font-color);
		text-align: center;
		width: 100%;
		//margin-left: -100upx;
	}

	.zai-form {
		margin-top: 20upx;
	}

	.zai-input {
		background: #e2f5fc;
		margin-top: 30upx;
		border-radius: 100upx;
		padding: 20upx 40upx;
		font-size: 30upx;
	}


	.input-placeholder,
	.zai-input {
		color: var(--global-font-color);
	}

	.zai-label {
		padding: 60upx 0;
		text-align: center;
		font-size: 30upx;
		color: var(--global-font-color);
	}

	.zai-btn {
		background: $btn-color-primary;
		color: #fff;
		border: 0;
		border-radius: 100upx;
		font-size: 36upx;
	}

	.zai-btn:after {
		border: 0;
	}

	/*按钮点击效果*/
	.zai-btn.button-hover {
		transform: translate(1upx, 1upx);
	}

	.form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 55%;

		.title {
			font-size: 38rpx;
			font-weight: bolder;
			margin-top: 15rpx;
		}

		.desc {
			margin-top: 15rpx;
			font-size: 28rpx;
			color: var(--global-font-color);
		}

		.btn-group {
			width: 80%;

			.btn {
				margin: 30rpx 0rpx;

				.u-button {
					height: 100rpx;
				}
			}
		}
	}

	@media (min-width: 600px) {

		.uni-tabbar,
		.uni-header,
		.uni-page-head,
		.bg,
		.nav,
		uni-page-body {
			max-width: 600px;
			margin: 0 auto
		}
	}
</style>