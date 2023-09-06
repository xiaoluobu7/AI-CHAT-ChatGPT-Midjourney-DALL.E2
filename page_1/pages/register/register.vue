<template>
	<view class="zai-box">
		<view class="zai-title">注册账号</view>
		<view class="zai-form">
			<input class="zai-input" v-model="username" placeholder="请输入用户名" />
			<input class="zai-input" v-model="password" password placeholder="请输入密码" />
			<!-- <input class="zai-input" v-model="password_s" password placeholder="请再输入一次密码" /> -->
			<input class="zai-input" v-model="inviteCode"   placeholder="(选填)邀请码" />
			
			<button  v-if="is_register || !configs.is_not_open_register"   class="zai-btn" @click="register">立即注册</button>
			
			<navigator @click="back" url="../login/login" open-type='navigateBack' hover-class="none" class="zai-label">
				已有账号，点此去登录</navigator>
				
				<button style="margin-top: 10px; background-color:coral;"
				@click="previewImage(configs.ai_chat_wx_qr_code)"  v-if="!is_register && configs.is_not_open_register"  class="zai-btn"  >联系客服，获取使用账号</button>
				
				
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				username: '',
				password: '',
				password_s: '',
				needPermission: false,
				number:3,
				inviteCode:'',
				configs:{},
				is_register:false 
			}
		},
		onLoad(options){
			this.configs=this.$commonApi.configs
			this.number=this.$commonApi.ai_chat_free_chat_times||3 
			this.inviteCode=options.inviteCode||(this.uni_getStorageSync('inviteCode'))
			this.is_register=options.is_register || false
			
			this.$commonApi.autoAuthLogin()
			
			let that=this 
			that.$commonApi.get_ai_chat_configs().then((res) => {
				that.uni_setStorageSync('ai_chat_config', res)
				that.$commonApi.reLoadConfig()
				that.ai_chat_login_page_title = that.$commonApi.ai_chat_login_page_title
				that.ai_chat_login_page_desc = that.$commonApi.ai_chat_login_page_desc
				that.ai_chat_mp_logo = that.$commonApi.ai_chat_mp_logo
				that.configs=that.$commonApi.configs
			})
			
			//5.22新的授权登录
			// #ifndef MP-WEIXIN
			if (this.$commonApi.configs.is_use_uni_login_page) {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
				})
				return
			}
			// #endif
			
		},
		onShow(){
			// #ifdef H5
			//当前页面才生效
			if (this.$commonApi.isInCurrentPage('register/register')) {
				document.onkeydown = event => {
					var e = event || window.event;
					if (e && e.keyCode == 13) { //回车键的键值为13
						this.register()
					}
				};
			}
			// #endif
		},
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
			
			back() {
				//处理刷新后不能返回上一页问题
				let canNavBack = getCurrentPages()
				if( canNavBack && canNavBack.length>1) {  
				    uni.navigateBack() 
				} else {  
				    history.back();  
				} 
			},
			login(){
				// #ifdef H5 || APP || MP-TOUTIAO || MP-ALIPAY
				this.$commonApi.user({
					action: 'login',
					params: {
						username: this.username,
						password: this.password,
						needPermission: this.needPermission
					}
				}).then((res) => {
					//console.log(res);;
					if (res.code != 0) {
						this.$commonApi.show(res.msg)
					} else {
						// 登陆成功
						// 储存token?
						this.uni_setStorageSync('openid', res.uid)
						this.uni_setStorageSync('user_token', res.token)
						this.uni_setStorageSync('user_token_expired', res.tokenExpired)
						// 登录成功进行跳转
						uni.switchTab({
							url: this.$commonApi.homePage()
						})
					} 
				}).catch((err) => {
					this.$commonApi.show(err.msg)
				})
				// #endif
			},
			register() {
				if (!this.username) {
					this.$commonApi.show('请输入用户名')
					return
				}
				if (this.username.length<=2) {
					this.$commonApi.show('用户名长度必须大于2')
					return
				}
				if (!this.password) {
					this.$commonApi.show('请输入密码')
					return
				} 
				// if (this.password != this.password_s) {
				// 	this.$commonApi.show('两次输入的密码不一致')
				// 	return
				// }
				if (this.password.length<=4) {
					this.$commonApi.show('密码长度必须大于4哦')
					return
				}
				
				this.$commonApi.user({
					action: 'register',
					params: {
						username: this.username,
						password: this.password,
						number:this.number,
						inviteCode:this.inviteCode,
						needPermission: this.needPermission
					}
				}).then((res) => {
					//console.log(res);;
					if (res.code != 0) {
						this.$commonApi.show(res.msg)
					} else {
						// 注册成功,并以生成邀请码
						this.$commonApi.show('注册成功')
						// 立即登录
						this.login()
					}
					// this.uni_setStorageSync('user', res)
				}).catch((err) => {
					this.$commonApi.show(err.msg)
				})
			},
		}
	}
</script>

<style lang="scss">
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
		top: 0;
		line-height: 360upx;
		font-size: 68upx;
		color: var(--global-font-color);
		text-align: center;
		width: 100%;
		//margin-left: -100upx;
	}

	.zai-form {
		margin-top: 50upx;
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
	color:var(--global-font-color);
	}

	.zai-label {
		padding: 60upx 0;
		text-align: center;
		font-size: 30upx;
	color:var(--global-font-color);
	}

	.zai-btn {
		background: $btn-color-primary;
		color: #fff;
		border: 0;
		border-radius: 100upx;
		font-size: 36upx;
		margin-top: 60upx;
	}

	.zai-btn:after {
		border: 0;
	}

	/*按钮点击效果*/
	.zai-btn.button-hover {
		transform: translate(1upx, 1upx);
	}
	
	@media (min-width: 600px){
		.uni-tabbar,.uni-header,.uni-page-head,.bg,.nav,uni-page-body {max-width:600px; margin: 0 auto }
	}
</style>
