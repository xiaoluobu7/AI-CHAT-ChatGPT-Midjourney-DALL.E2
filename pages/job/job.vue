<template>
	<view class="my" :data-theme="state.app.theme">
		<view class="my-main-item">
			<view class="user-card">
				<view class="user-card-main">
					<view class="left">
						<view class="my-user-item-left">
							<navigator open-type="switchTab" url="/pages/me/me">
								<image class="my-user-img" :src="user.avatar"> </image>
							</navigator>
							<view class="my-user-info">
								<view class="my-user-name">{{user.username||user.nickname}}</view>
								<view class="my-user-text">开通会员，畅享无限次数</view>
							</view>
						</view>
					</view>
					<view class="right">
						<navigator open-type="navigate" url="/pages/vip/vip">
							<view class="current-point">
								<view class="text" v-if="!configs.ai_chat_open_free_chat">剩余次数：
									<text v-if="(user.isvip == 1 && !user.isExpired)" class="num">不限</text>
									<text v-if="user.isvip == 1 && user.isExpired" class="num">
										{{(user.number<=0?0:user.number) || 0}}
									</text>
									<text v-if="user.isvip != 1" class="num">
										{{(user.number<=0?0:user.number) || 0}}
									</text>
								</view>
								<view class="text" v-if="configs.ai_chat_open_free_chat">剩余次数：
									<text class="num">不限</text>
								</view>

							</view>
						</navigator>
					</view>
				</view>
				<view class="bottom"></view>
			</view>
		</view>


		<view class="task-list">
			<view class="common-card">
				<view class="title"><text>任务中心</text>
					<view class="message"></view>
				</view>
				<view class="main">
					<view class="task-item middle">
						<view class="left">
							<image src="/static/common/signin.png"></image>
							<view class="content">
								<view class="title">签到领次数</view>
								<view class="text"><text
										class="red">{{configs.sign_send_times}}</text><text class="">次/签</text><text class="">，每日限</text><text
										class="red">{{configs.sign_limit_times||1}}</text><text>签</text>
								</view>
								<view class="process">进度
									{{task.sign_finish_times||0}}/{{configs.sign_limit_times||1}}
								</view>
							</view>
						</view>
						<view class="right" v-if="task.sign_finish_times>=configs.sign_limit_times">
							<view class="click-button">
								{{task.sign_finish_times>=configs.sign_limit_times?'完成':'签到'}}
							</view>
						</view>
						<view class="right" @click="signTask" v-else>
							<view class="click-button">
								{{task.sign_finish_times>=configs.sign_limit_times?'完成':'签到'}}
							</view>
						</view>
					</view>

					<view class="task-item middle" @click="inviteUser">
						<view class="left">
							<image src="/static/common/invite-new-user.png"></image>
							<view class="content">
								<view class="title">邀请好友</view>
								<view class="process">进度
									{{task.invite_finish_times||0}}/{{task.invite_limit_times||5}}
								</view>
							</view>
						</view>
						<view class="right">
							<view class="click-button">邀请</view>
						</view>
					</view>


					<!-- #ifdef MP-WEIXIN -->
					<view class="task-item middle" v-if="configs.ai_chat_ad_id_reward">
						<view class="left">
							<image src="/static/common/video.png"></image>
							<view class="content">
								<view class="title">激励视频</view>
								<view class="process">完成进度 {{task.ads_finish_times||0}}/{{task.ads_limit_times||5}}
								</view>
							</view>
						</view>
						<view class="right">
							<view class="click-button" @click="adClick">播放</view>
						</view>
					</view>
					<!-- #endif -->

				</view>
			</view>
		</view>
			
	</view>

</template>


<script>
	let videoAd = null;

	export default {
		data() {
			return {
				user: {},
				dataList: [],
				task: {},
				configs: {},
				state: {},
			}
		},
		onLoad() {
			//this.initData()
		},
		onShow() {
			this.state = this.$store.state
			this.$commonApi.is_login()
			this.configs = this.$commonApi.configs
			this.adLoad()
			this.initData()
			this.userInfo()
		},
		methods: {
			inviteUser() {
				uni.navigateTo({
					url: '/page_1/pages/invite/invite'
				})
			},
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



		},
	}
</script>

<style lang="scss" scoped>
	@import "@/pages/job/job.scss";
</style>