<template>
	<view class="my" :data-theme="state.app.theme">
		<view class="user_main">
			<view class="vip_unlock" style="margin-top: 20px;" @click="createOrder">
				<view class="unlock_box">
					<view class="unlock_left">
						<image style="width: 45px;height: 45px;" src="/static/me/star.png"></image>
						<view class="title" style="font-size: 28rpx;" v-if="user.isvip == 1">
							<view class="h1">会员到期时间</view>
							<view class="p" v-if="!user.isExpired">{{end_time||'不限'}}</view>
							<view class="p" v-if="user.isExpired">已到期，续费后畅享无限对话</view>
						</view>

						<view class="title" style="font-size: 28rpx;" v-if="user.isvip !=1">
							<view class="h1">升级专业版</view>
							<view class="p">畅享无限对话</view>
						</view>

					</view>
					<view class="unlock_right">
						<view class="ubtn open">{{user.isvip == 1 ? `去续费` :"去开通"}}</view>
					</view>
				</view>
			</view>


			<view class="nav_box" style="margin-bottom: 15px;">
				<view class="nav_item" @click="inputDialog">
					<view class="text-blue icon cuIcon-time">
						<image src="/static/me/kmdh.png" style="width: 20px;height: 20px;"></image>
				
					</view>
					<view class="txt">卡码充值</view>
				</view>
				
				<view class="nav_item" @click="taskcenter">
					<view class="text-blue icon cuIcon-time">
						<image src="/static/me/taskcenter.png" style="width: 20px;height: 20px;"></image>
					</view>
					<view class="txt">任务中心</view>
				
				
				</view>
				<navigator class="nav_item" url="/page_1/pages/invite/invite">
					<view class="text-red icon cuIcon-share">
						<image src="/static/me/tjzq.png" style="width: 20px;height: 20px;"></image>
					</view>
					<view class="txt">推荐赚钱</view>
				</navigator>


				<view class="nav_item" @click="Personalsettings">
					<view class="text-black icon cuIcon-exit">
						<image src="/static/me/center.png" style="width: 20px;height: 20px;"></image>
					</view>
					<view class="txt">资料设置</view>
				</view>



				<view class="nav_item" @click="mpDialogShow" v-if="contactMpWeixin">
					<view class="text-green icon cuIcon-weixin">
						<image src="/static/me/gzgzh.png" style="width: 20px;height: 20px;"></image>
					</view>
					<view class="txt">关注公众号</view>
				</view>


				<view class="nav_item" @click="askPage">
					<view class="text-blue icon cuIcon-time">
						<image src="/static/me/qalist.png" style="width: 20px;height: 20px;"></image>
					</view>
					<view class="txt">问答记录</view>
				</view>

				<view class="nav_item" @click="kefuDialogShow">
					<view class="text-green icon cuIcon-weixin">
						<image src="/static/me/contact.png" style="width: 20px;height: 20px;"></image>
					</view>
					<view class="txt">联系我们</view>
				</view>

				<view class="nav_item" @click="outlogins" v-if="!configs.is_not_show_logout">
					<view class="text-black icon cuIcon-exit">
						<image src="/static/me/exit.png" style="width: 20px;height: 20px;"></image>
					</view>
					<view class="txt">退出登录</view>
				</view>


			</view>



		</view>

		<!-- #ifdef MP-WEIXIN -->
		<ad v-if="ai_chat_ad_id_me_bottom" :unit-id="ai_chat_ad_id_me_bottom" ad-type="video" ad-theme="white"></ad>
		<!-- #endif -->

		<uni-popup ref="inputDialog" type="dialog">
			<uni-popup-dialog ref="inputClose" mode="input" title="联系客服购买卡号或兑换码" placeholder="请输入卡号或兑换码"
				@confirm="dialogInputConfirm"></uni-popup-dialog>
		</uni-popup>

		<uni-popup ref="kefuDialog" type="dialog">
			<view style="width:100%;margin: 0 auto;text-align: center">
				<image :show-menu-by-longpress="true" @click="previewImage" style="max-width:300px;"
					:src="ai_chat_wx_qr_code" mode="heightFix"></image>
			</view>
		</uni-popup>

		<uni-popup ref="updateUserInfo_Dialog" type="dialog">
			<view class="zai-box">
				<view class="zai-title">修改用户信息</view>
				<view class="zai-form">
					<input class="zai-input" v-model="username" placeholder="请输入用户名" />
					<input class="zai-input" v-model="password" password placeholder="请输入密码" />
					<input class="zai-input" v-model="password_s" password placeholder="请再输入一次密码" />
					<input class="zai-input" v-if="!user.inviteCode&&user.inviteCode!=user.my_invite_code" v-model="inviteCode" maxlength="8"
						placeholder="(选填)邀请码" />
					<button class="zai-btn" @click="updateUserInfoApi">修改</button>

				</view>
			</view>
		</uni-popup>


	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'

	let videoAd = null;

	export default {
		data() {
			return {
				user: {},
				order_no: "",
				out_trade_no: "",
				description: "订单", // 支付描述
				type: "test",
				ai_chat_wx_qr_code: '',
				contactMpWeixin: '',
				ai_chat_ad_id_me_bottom: '',
				end_time: '',


				username: '',
				password: '',
				password_s: '',
				needPermission: false,
				inviteCode: '',
				ai_chat_open_free_chat: false,
				is_ios: false,
				is_mp_weixin: false, //true：公众号，false：个人微信

				state: {},
				themeImg: '/static/me/white.png',
				configs: {},

				//我的任务数据
				dataList: [],
				task: {},

				isNewVersion: false,
				appDownloadUrl: ''

			}
		},
		onShareAppMessage: function() {
			let user = this.uni_getStorageSync('user');
			let that = this

			this.$commonApi.addNumber({
				openid: user.openid,
				number: this.$commonApi.configs.shareAppNumber || 3
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
				number: this.$commonApi.configs.shareAppNumber || 3
			}).then((resuls) => {
				console.log(resuls);
			})
			return {
				title: this.$commonApi.getShareTitle() + ' 你也来试试吧',
				path: this.$commonApi.homePage() + '?type=pengyouquan&inviteCode=' + user.my_invite_code
			};
		},

		onShow() {
			this.state = this.$store.state
			this.userInfo()
			this.get_ai_chat_config()
			this.ai_chat_open_free_chat = this.$commonApi.configs.ai_chat_open_free_chat
			this.configs = this.$commonApi.configs

			if (!this.configs.is_not_show_invite_image) {
				this.configs.invite_background_image = "/static/me/invite.png"
			}
		},
		onLoad() {
			this.$commonApi.is_login()

			this.state = this.$store.state
			this.themeImg = this.state.app.theme == 'day-theme' ? '/static/me/white.png' : '/static/icos/me/black.png'
			this.ai_chat_ad_id_me_bottom = this.$commonApi.ai_chat_ad_id_me_bottom
			this.is_ios = uni.getSystemInfoSync().platform == 'ios'
			// #ifdef H5
			//h5不用ios支付
			this.is_ios = false
			// #endif

			this.adLoad()
			this.initData()

			let appDownloadUrlCache = this.uni_getStorageSync('appDownloadUrl') || ''
			this.appDownloadUrl = this.$commonApi.configs.appDownloadUrl || ''
			if (this.appDownloadUrl && appDownloadUrl != appDownloadUrlCache) {
				//有新版本
				this.isNewVersion = true
			}

		},
		methods: {
			...mapMutations('app', ['SET_THEME']),
			changeTheme() {
				let newTheme = this.state.app.theme == 'day-theme' ? 'night-theme' : 'day-theme'
				this.themeImg = newTheme == 'day-theme' ? '/static/me/white.png' : '/static/icos/me/black.png'
				this.SET_THEME(newTheme)

				this.$commonApi.changeTheme(newTheme)
			},
			updateApp() {
				//当前app版本
				if (!this.appDownloadUrl) {
					return
				}
				let appurl = this.appDownloadUrl

				// #ifdef APP
				uni.downloadFile({
					url: appurl,
					success: download => {
						if (download.statusCode == 200) {
							plus.runtime.install(
								download.tempFilePath, {
									force: false
								},
								() => {
									uni.hideLoading();
									plus.runtime.restart(); //更新成功启动
								},
								err => {
									//若没下载成功还是去下载
									uni.hideLoading();
									uni.showToast({
										title: '更新失败，将跳转下载页面',
										icon: 'none',
										duration: 2000
									});
								}
							);
							setTimeout(function() {
								plus.runtime.openURL(appurl);
							}, 2000);
						}
					}
				});

				// #endif

			},
			//长按识别二维码
			previewImage(e) {
				let url = this.is_mp_weixin ? this.contactMpWeixin : this.ai_chat_wx_qr_code
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
			get_ai_chat_config() {
				this.$commonApi.get_ai_chat_configs().then((res) => {
					this.uni_setStorageSync('ai_chat_config', res)
					this.showChat = false
					for (let s of res) {
						if (s.key == 'is_showChat' && !(!s.val)) {
							this.showChat = true
							break
						}
					}
					this.ai_chat_wx_qr_code = ''
					for (let s of res) {
						if (s.key == 'ai_chat_wx_qr_code') {
							this.ai_chat_wx_qr_code = s.val
							break
						}
					}
					//公众号
					this.contactMpWeixin = ''
					for (let s of res) {
						if (s.key == 'contactMpWeixin') {
							this.contactMpWeixin = s.val
							break
						}
					}
				})
			},
			kefuDialogShow() {
				this.is_mp_weixin = false
				this.previewImage()
				return
				this.$refs.kefuDialog.open()
			},
			mpDialogShow() {
				//公众号
				this.is_mp_weixin = true
				this.previewImage()
			},
			taskcenter() {
				uni.switchTab({
					url: '/pages/job/job'
				})
				uni.navigateTo({
					url: '/pages/job/job'
				})
			},
			Personalsettings() { 
				uni.navigateTo({
					url: '/page_1/pages/me/profile'
				})
			},
			toPage(url){
				uni.navigateTo({
					url:url
				})
			},
			askPage() {
				if (false && !this.$commonApi.isVip()) {
					uni.showToast({
						title: '升级为vip会员才能查阅提问记录',
						icon: 'none'
					})
					return false
				}
				uni.navigateTo({
					url: '/page_1/pages/home/qa'
				})
			},
			async delUser() {
				let that = this
				uni.showModal({
					title: "温馨提醒", // 标题  
					content: '删除账号后无法恢复，是否确定删除?',
					showCancel: true, // 可以不要  
					confirmText: "删除",
					success: (res) => {
						if (res.confirm) {
							that.$commonApi.user({
								action: 'delUser'
							}).then((res) => {
								uni.showToast({
									title: "删除成功",
									icon: 'none'
								});
								that.outlogins(false)
							})
						}
					}
				})
			},
			outlogins(isTip) {
				if (isTip) {
					uni.showToast({
						title: "退出成功",
						icon: 'none'
					});
				}
				setTimeout(() => {
					uni.removeStorageSync('user_token');
					uni.removeStorageSync('user');
					uni.reLaunch({
						url: this.$commonApi.homePage()
					})
				}, 500)

			},
			dialogInputConfirm(e) {
				let user = this.uni_getStorageSync('user');
				this.$commonApi.ai_chat_redeem_code({
					openid: user.openid,
					code: e
				}).then((res) => {
					this.userInfo()
					if (res.code == 200) {
						//this.userInfo()
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},
			inputDialog() {
				this.$refs.inputDialog.open()
			},
			createOrder(provider) {
				let ios_app = false
				// #ifdef APP-PLUS || APP || APP-PLUS-NVUE || APP-VUE
				//ios app 才跳转单独的ios支付
				ios_app = this.is_ios
				// #endif
				if (ios_app) {
					uni.navigateTo({
						url: "/pages/my/iosiap"
					})
				} else {
					uni.navigateTo({
						url: "/pages/vip/vip"
					})
				}
			},
			deleImg(e) {
				// #ifdef H5
				this.$commonApi.user({
					action: 'setAvatar',
					params: {
						avatar: '/static/common/avatar.png'
					},
				}).then((res) => {
					this.userInfo()
				})
				// #endif
				// #ifdef MP-WEIXIN
				this.$commonApi.user({
					action: 'setAvatar',
					params: {
						avatar: e.detail.avatarUrl
					},
				}).then((res) => {
					this.userInfo()
				})
				// #endif
			},
			userInfo() {
				if (!this.$commonApi.get_user_token()) {
					//登录系统
					this.$commonApi.is_login()
					return false
				}

				this.$commonApi.user({
					action: 'checkToken'
				}).then((res) => {
					//判断是否用户不存在
					res.openid = this.$commonApi.get_openid()
					this.user = res
					this.user.isExpired = this.user.endTime && new Date(this.user.endTime) < new Date()
					if (res.code == 404) {
						this.outlogins()
						return
					}
					if (!this.user.avatar) {
						this.user.avatar = '/static/common/avatar.png'
					}

					this.end_time = this.$getTime(this.user.endTime)
					if (this.user.isvip == 1 && !this.user.endTime) {
						this.end_time = ''
					}
					this.uni_setStorageSync('user', this.user);
					this.$commonApi.is_login()
					//console.log(res);;
				})
			},
			copy(val) {
				uni.setClipboardData({
					data: val,
					success: function() {
						uni.showToast({
							title: '复制成功',
							icon: 'none'
						})
					}
				});
			},
			copyShareUrl() {
				this.$commonApi.shareResisterUrl()
			},
			updateUserInfoDialog() {
				uni.navigateTo({
					url: '/page_1/pages/me/profile'
				})
				return
				if (!this.$commonApi.configs.isNotUpdateUserInfo) {
					this.$refs.updateUserInfo_Dialog.open()
				}
			},
			updateUserInfoApi() {

				if (!this.username) {
					this.$commonApi.show('请输入英文用户名')
					return
				}
				if (this.username.length <= 2) {
					this.$commonApi.show('英文用户名长度必须大于2')
					return
				}
				if (!this.password || !this.password_s) {
					this.$commonApi.show('请输入密码')
					return
				}
				if (this.password != this.password_s) {
					this.$commonApi.show('两次输入的密码不一致')
					return
				}
				if (this.password.length <= 4) {
					this.$commonApi.show('密码长度必须大于4哦')
					return
				}
				this.$commonApi.user({
					action: 'updateUser',
					params: {
						username: this.username,
						password: this.password,
						needPermission: this.needPermission,
						inviteCode: this.inviteCode || '',
					}
				}).then((res) => {
					//console.log(res);;
					if (res.code != 0) {
						this.$commonApi.show(res.msg)
					} else {
						this.$refs.updateUserInfo_Dialog.close()
						this.$commonApi.show(res.msg)
						this.userInfo()
					}
				}).catch((err) => {
					this.$commonApi.show(err.msg)
				})
			},


			//每日任务 add
			signTask() {
				if (this.task.sign_finish_times >= this.task.sign_limit_times) {
					uni.showToast({
						title: '今日签到任务完成'
					})
					return
				}
				this.$commonApi.user({
					action: 'sign',
					params: {}
				}).then((res) => {
					if (res.code > 0) {
						uni.showToast({
							title: res.msg
						})
						return
					}
					this.task.sign_finish_times += 1
					uni.showToast({
						title: '签到成功'
					})

					this.userInfo()
				})
			},
			initData() {
				this.user = this.uni_getStorageSync('user')
				this.getList()
			},
			getList() {
				this.$commonApi.user({
					action: 'get-ai-chat-job-list',
					params: {}
				}).then((res) => {
					let tmp = {}
					tmp.invite_limit_times = this.configs.invite_limit_times || '--'
					tmp.share_finish_times = 0
					tmp.share_limit_times = this.configs.ai_chat_share_time_day || '--'
					tmp.ads_finish_times = 0
					tmp.ads_limit_times = this.configs.ads_limit_times || 5
					tmp.sign_finish_times = 0
					tmp.sign_limit_times = this.configs.sign_limit_times || 1

					for (let s of res.data) {
						if (s.type == '邀请') {
							tmp.invite_finish_times += 1
						} else if (s.type == '签到') {
							tmp.sign_finish_times += 1
						} else if (s.type == '观看视频') {
							tmp.ads_finish_times += 1
						} else if (s.type == '分享') {
							tmp.share_finish_times += 1
						}
					}
					this.task = tmp
				})
			},
			copyShareUrl() {
				this.$commonApi.shareResisterUrl()
			},

			adClick() {
				var that = this
				if (videoAd) {
					videoAd.show().catch(err => {
						// 失败重试
						// console.log("广告拉去失败")
						videoAd.load().then(() => videoAd.show())
					})
				}
			},
			adLoad() {
				var that = this
				// #ifdef MP-WEIXIN
				if (wx.createRewardedVideoAd && this.$commonApi.ai_chat_ad_id_reward) {
					//let tmp_adUnitId=this.$commonApi.ai_chat_ad_id_reward
					//播放视频，激励回答次数
					videoAd = wx.createRewardedVideoAd({
						adUnitId: this.$commonApi.ai_chat_ad_id_reward
					});
					//捕捉错误
					videoAd.onError(err => {
						// 进行适当的提示
						console.log('videoAd onError', res);
					});
					// 监听关闭
					videoAd.onClose(status => {
						if ((status && status.isEnded) || status === undefined) {
							// 正常播放结束，下发奖励
							that.ai_chat_user_credits()
						} else {
							// 播放中途退出，进行提示
							uni.showModal({
								title: "视频未播放完成，无法获得问答奖励次数哦"
							})
						}
					});
				}
				// #endif
			},

			ai_chat_user_credits() {
				let user = this.uni_getStorageSync('user');
				var that = this;
				let addTimes = Number(this.$commonApi.configs.ads_send_times || 5);

				uni.showToast({
					title: '观看完视频，获得' + addTimes + '提问次数...'
				})
				that.$commonApi.addNumber({
					openid: user.openid,
					type: '观看视频',
					number: addTimes
				}).then((resuls) => {
					console.log(resuls);
				})
				user.number = user.number + addTimes;

				//视频积分
				that.$commonApi.ai_chat_user_credits({
					openid: user.openid,
					number: addTimes
				}).then((resuls) => {
					console.log(resuls);
				})
				user.broadNumber = user.broadNumber + addTimes;
				this.uni_setStorageSync('user', user);
				this.user = user
				this.task.ads_finish_times += addTimes
				this.userInfo()
			},
			inviteUser() {
				uni.navigateTo({
					url: '/page_1/pages/invite/invite'
				})
			},

		}
	}
</script>

<style lang="scss" scoped>
	@import "@/pages/me/me.scss";
	@import "@/pages/job/job.scss";
</style>