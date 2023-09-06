<template>
	<view class="zai-box">
		<view class="zai-form">
			<input class="zai-input" v-model="username" placeholder="请输入用户名" />
			<input class="zai-input" v-model="password" password placeholder="请输入新密码" />
			<input class="zai-input" v-model="password_s" password placeholder="请输入原始密码,初始秘密空或123456" />
			<input class="zai-input"  v-if="!user.inviteCode&&user.inviteCode!=user.my_invite_code"  v-model="inviteCode" maxlength="8"
				placeholder="(选填)邀请码" />
			<button class="zai-btn" @click="updateUserInfoApi">修改资料</button>
	
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				user:{},
				username: '',
				password: '',
				password_s: '',
				needPermission: false,
				number:3,
				inviteCode:'',
			}
		},
		onLoad(options){
			this.$commonApi.is_login()
			this.user= this.uni_getStorageSync('user');
			this.number=this.$commonApi.ai_chat_free_chat_times||3
			this.inviteCode=this.uni_getStorageSync('inviteCode')
		},
		methods: {
			back() {
				//处理刷新后不能返回上一页问题
				let canNavBack = getCurrentPages()
				if( canNavBack && canNavBack.length>1) {  
				    uni.navigateBack() 
				} else {  
				    history.back();  
				} 
			},
			updateUserInfoApi() {
				if (!this.username) {
					this.$commonApi.show('请输入英文用户名')
					return
				}
				if (this.username.length<=2) {
					this.$commonApi.show('英文用户名长度必须大于2')
					return
				}
				if (!this.password) {
					this.$commonApi.show('请输入新密码')
					return
				} 
				if (this.password.length<=4) {
					this.$commonApi.show('密码长度必须大于4哦')
					return
				}
				if (!this.password_s) {
					this.$commonApi.show('请输入原始密码')
					return
				}
				
				this.$commonApi.user({
					action: 'updateUser',
					params: {
						username: this.username,
						password: this.password,
						password_s: this.password_s,
						needPermission: this.needPermission,
						inviteCode: this.inviteCode || '',
					}
				}).then((res) => {
					if (res.code != 0) {
						this.$commonApi.show(res.msg)
					} else {
						if(this.$refs.updateUserInfo_Dialog){
							this.$refs.updateUserInfo_Dialog.close()
						}
						this.$commonApi.show(res.msg)
						setTimeout(()=>{
							this.back()
						},1000)
					}
				}).catch((err) => {
					this.$commonApi.show(err.msg)
				})
			},
			register() {
				if (!this.username) {
					this.$commonApi.show('请输入英文用户名')
					return
				}
				if (this.username.length<=2) {
					this.$commonApi.show('英文用户名长度必须大于2')
					return
				}
				if (!this.password || !this.password_s ) {
					this.$commonApi.show('请输入密码')
					return
				} 
				if (this.password != this.password_s) {
					this.$commonApi.show('两次输入的密码不一致')
					return
				}
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

<style lang="scss" scoped>
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
		color: rgba(0,0,0,.5);
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
