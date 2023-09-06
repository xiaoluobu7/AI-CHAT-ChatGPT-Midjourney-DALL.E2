<template>
	<view id="main" :data-theme="state.app.theme">
		<!-- #ifndef MP -->
		<view class="chat" v-if="!showChat">
			<view style="width:100%;margin-top:30%;text-align: center">
				<image :show-menu-by-longpress="true" @click="previewImage" style="width:90%;" :src="ai_chat_wx_qr_code"
					mode="widthFix"></image>
			</view>
		</view>
		<!-- #endif -->

		<!-- 轮播区 -->
		<view class='swiper' v-if="banners.length>0">
			<u-swiper :list="banners"></u-swiper>
		</view>
		<!-- 滚动通知 -->
		<view class="NoticeBar" v-if="noticeBar">
			<u-notice-bar :text="noticeBar" mode="closable"></u-notice-bar>
		</view>

		<view id="menus" v-if="showChat">
			<swiper class="ct_tab" v-if="tabList.length>0" @change="swiperChange" :current="currentImgIndex">
				<swiper-item :class="{ct_item:true,ct_active:index==tabCur}" v-for="(item, index) in tabList"
					:key="index" @click="clickCtTab(index)">
					<text
						:style="{'padding':'30upx 0', 'border-bottom':index==tabCur?'2px solid #686efe':'2px solid transparent'}"
						v-text="item"></text>
				</swiper-item>
			</swiper>

			<view v-for="(menus,tabIndex) in menuTabList" v-show="tabIndex==tabCur">
				<view class="mui-content" v-for="m in menus">
					<view class="mui-table-view" v-if="m.module">
						<view class="mui-navigate-title">{{m.module}}</view>
					</view>

					<view class="mui-table-view mui-grid-view mui-grid-9">
						<view class="mui-table-view-cell mui-media mui-col-xs-4 " v-if="!item.onlyH5"
							:class="isActive==item.index?'activeItem item ':'item '" v-for="(item,index) in m.menus"
							:key="index" @click="toModule(item)">
							<image class="mui-media-icon" style="height: 30px;" :src="item.url" mode="heightFix">
							</image>
							<view class="mui-media-body">{{item.title}}</view>
							<!-- 只是pc版本才显示描述,app不显示 -->
							<view class="mui-media-desc">{{item.description}}</view>
						</view>
					</view>
				</view>
			</view>

			<!-- #ifdef H5 -->
			<view class="mui-media-desc" v-if="beianhao" style="text-align: center;">
				<a id="domain" style="color:blue " target="_blank" href="http://beian.miit.gov.cn/"
					hover-class="none">{{beianhao}}</a>
			</view>
			<!-- #endif -->

			<!-- #ifdef MP-WEIXIN -->
			<view class="share" v-if="false" style="bottom: 103px;">
				<u-button shape="circle" class="primary-color" color="#686efe" :plain="true" icon="share"
					open-type="share" text="分享给朋友+3">
				</u-button>
			</view>
			<!-- #endif -->

			<view class="share" v-if="false">
				<u-button shape="circle" @click="kefuDialogShow()" class="primary-color" color="#686efe" text="加入微信群">
				</u-button>
			</view>


			<view class="home_more" @click="homeMore" v-if="!isNotShowHomeJoin">
				<image src="/static/tabbar/app1.png" style="height: 40px;" mode="heightFix"></image>
			</view>


			<uni-popup ref="kefuDialog" type="dialog">
				<view style="width:100%;margin: 0 auto;text-align: center">
					<image :show-menu-by-longpress="true" @click="previewImage" style="max-width:300px;"
						:src="ai_chat_wx_qr_code" mode="heightFix"></image>
				</view>
			</uni-popup>

			<uni-popup ref="inputDialog" type="dialog">
				<uni-popup-dialog ref="inputClose" mode="input" title="请输入会员兑换码" placeholder="请输入会员兑换码"
					@confirm="dialogInputConfirm"></uni-popup-dialog>
			</uni-popup>


			<!-- 非微信小程序客户端 -->
			<!-- #ifndef MP-WEIXIN -->
			<uni-popup ref="wx_browser_login_Dialog" type="dialog">
				<view id="wx_browser" class="zai-box">
					<view class="zai-title">授权登录</view>
					<view class="zai-form">
						<button class="zai-btn" @click="getWxUserInfoCode(false,true)">微信网页登录</button>
					</view>
				</view>
			</uni-popup>
			<!-- #endif -->
		</view>


		<uni-popup ref="qrcodeLogin" type="dialog" :maskClick='false'>
			<view class="u-mode-center-box"
				style="background-color: #fff;width: 301px; height: auto; z-index: 9999; margin-top: 0px; border-radius: 9px; overflow: hidden;">
				<scroll-view class="u-drawer__scroll-view">
					<view class="scroll-view">
						<view class="scroll-view" style="overflow: hidden auto;">
							<view class="scroll-view-content">
								<view class="officia-tel" style="padding-top: 39px;">登录领取免费提问次数</view>
								<view style="display: flex; justify-content: center;">
									<view class="officia-img">
										<canvas canvas-id="qrcode"
											style="width: 400rpx;height:400rpx;margin: 0 auto;" />
										<view @click="getMpQrCode" v-if="qrcodeExpired" class="overtime-item">
											二维码已失效，重新获取<text class="overtime-item-text gestures"></text></view>
									</view>
								</view>
								<view class="officia-tips">{{qrcodeLogin_msg||'微信扫码-关注公众号登录'}}</view>
								<view class="officia-tips" v-if="$commonApi.configs.allow_password_login"
									style="margin-top: -20pxcolor:var(--global-font-color);">
									<navigator open-type="navigate" url="/page_1/pages/login/login">账号密码登录</navigator>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>


		</uni-popup>

	</view>

</template>
<script>
	import uQRCode from '@/res/uqrcode.js' //引入uqrcode.js
	export default {
		data() {
			return {
				user: {},
				isActive: 0,
				ai_chat_wx_qr_code: '',

				aiChatAppList: [],
				menuTabList: [],
				tabCur: 0,
				currentImgIndex: 0,
				tabList: [],
				showChat: true,

				//4.11 add
				isToChatInnerPage: false, //点击后进入聊天页面

				is_weixin_brwser: false,
				wx_code: '', //授权登录code
				inviteCode: '', //邀请码
				isNotShowHomeJoin: false,
				ai_chat_key_word_list: [], //回复关键词

				banners: [], //banner
				noticeBar: '', //通知
				beianhao: '', //备案号
				qrcodeLogin_msg: '', //
				time_check_login: null,
				qrcodeExpired: false, //登录验证码是否过期
				state: {},
			}
		},
		onShareAppMessage: function() {
			let user = this.uni_getStorageSync('user');
			let that = this

			this.$commonApi.addNumber({
				openid: user.openid,
				number: this.$commonApi.configs.shareAppNumber || 3
			}).then((resuls) => {
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
			})
			return {
				title: this.$commonApi.getShareTitle() + ' 你也来试试吧',
				path: this.$commonApi.homePage() + '?type=pengyouquan&inviteCode=' + user.my_invite_code
			};
		},
		onShow() {
			this.state = this.$store.state
			let is_login = this.$commonApi.is_login(true);
			if (is_login && this.$refs.qrcodeLogin) {
				this.$refs.qrcodeLogin.close()
			}
			this.userInfo()
			this.get_ai_chat_config()
			this.getTemplateList()
		},
		async onLoad(options) {
			uni.showTabBar()
			this.state = this.$store.state
			this.inviteCode= this.$commonApi.bindPageScene(options)
			//等待加载配置6.3
			await this.$commonApi.get_ai_chat_configs()
			this.$commonApi.autoAuthLogin()
			this.loadLoginScan()
			this.iniData()
			
			//备案号，后台进行设置
			this.beianhao = this.$commonApi.configs.beianhao || ''
			this.$commonApi.save_share_invite_code(options.inviteCode || '')
			this.inviteCode = options.inviteCode || (this.uni_getStorageSync('inviteCode'))

			this.isToChatInnerPage = this.$commonApi.configs.isToChatInnerPage || false //点击后进入聊天页面
			this.getAiChatKeywords()
		},
		methods: {
			async loadLoginScan() {
				// #ifdef H5
				let is_login = this.$commonApi.is_login(true);
				if (!is_login) {
					//等待加载最新配置
					let mpurl = this.$commonApi.configs.mpurl; //公众号回调php api 5.10
					if (mpurl&&this.$commonApi.configs.ai_chat_pub_acc_oauth_back_url&&this.$commonApi.configs.ai_chat_pub_acc_app_secret) {
						var ua = navigator.userAgent.toLowerCase();
						if (!/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(ua)) {
							//pc公众号扫码登录
							this.getMpQrCode()
						}
					}
				}
				// #endif
			},
			swiperChange(e) {
				let index = e.detail.current
				this.clickCtTab(index)
			},
			getMpQrCode() {
				this.qrcodeExpired = false
				if (this.time_check_login) {
					clearInterval(this.time_check_login)
				}
				let that = this
				let user = this.uni_getStorageSync('user')

				this.$commonApi.user({
					action: 'getMpQrCode'
				}).then((res) => {
					if (res.code != 0) {
						return
					}
					let ticket = res.data.ticket
					this.qrFun(res.data.url)
					this.$refs.qrcodeLogin.open()
					//开启倒计时
					that.time_check_login = setInterval(() => {
						if (user) {
							clearInterval(that.time_check_login)
						}
						this.$commonApi.user({
							action: 'loginByMpQrCode',
							params: {
								ticket: ticket
							}
						}).then((res_login) => {
							if (res_login.code != 0) {
								return
							}
							this.uni_setStorageSync('openid', res_login.openid)
							this.uni_setStorageSync('user_token', res_login.token)
							this.uni_setStorageSync('user_token_expired', res_login.tokenExpired)
							this.uni_setStorageSync('user', res_login)
							that.user = res_login
							user = res_login
							clearInterval(that.time_check_login)
							that.$refs.qrcodeLogin.close()
						}).catch((err) => {
							//
						})
					}, 1000)
					setTimeout(() => {
						clearInterval(that.time_check_login)
						that.qrcodeExpired = true
					}, 40000)
				}).catch((err) => {
					console.log(err)
				})
			},
			qrFun: function(text) {
				uQRCode.make({
					canvasId: 'qrcode',
					componentInstance: this,
					text: text,
					size: 200,
					margin: 10,
					backgroundColor: '#ffffff',
					foregroundColor: '#000000',
					fileType: 'jpg',
					errorCorrectLevel: uQRCode.errorCorrectLevel.H,
					success: res => {

					}
				})
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
						this.getWxUserInfoCode(false, true)
					} else {
						// 登陆成功
						//console.log(res)
						// 储存token?
						this.uni_setStorageSync('openid', res.openid)
						this.uni_setStorageSync('user_token', res.token)
						this.uni_setStorageSync('user_token_expired', res.tokenExpired)
						this.uni_setStorageSync('user', res)
						this.$refs.wx_browser_login_Dialog.close()
						// 登录成功进行跳转
						try {
							uni.switchTab({
								url: this.$commonApi.homePage()
							})
						} catch (e) {
							//TODO handle the exception
						}
					}
					// this.uni_setStorageSync('user', res)
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
					// let uri = encodeURIComponent(link);
					window.location.href =
						`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${uri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
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
			//微信一键登录end
			// #endif

			//长按识别二维码
			previewImage(e) {
				uni.previewImage({
					// 需要预览的图片链接列表。若无需预览，可以注释urls
					urls: [this.ai_chat_wx_qr_code],
					// 为当前显示图片的链接/索引值
					current: this.ai_chat_wx_qr_code,
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
			async getAiChatKeywords() {
				//获取关键词
				this.uni_setStorageSync('ai_chat_key_word', this.ai_chat_key_word_list)
			},
			iniData() {
				this.aiChatAppList = this.uni_getStorageSync('ai_chat_app_list') || []
				this.menuTabList = this.uni_getStorageSync('menuTabList') || [
					[]
				]
				this.tabList = this.uni_getStorageSync('tabList') || []

				if (this.aiChatAppList) {
					let tmpTabList = []
					for (let s of this.aiChatAppList) {
						if (s.tabName && tmpTabList.indexOf(s.tabName) == -1) {
							tmpTabList.push(s.tabName)
						}
					}
					this.uni_setStorageSync('tabList', tmpTabList)
					this.tabList = tmpTabList

					let tmpTabChildren = []
					for (let tabName of tmpTabList) {
						let items = []
						for (let m of this.aiChatAppList) {
							if (m.tabName && m.tabName == tabName) {
								items.push(m)
							}
						}
						tmpTabChildren.push(items)
					}
					if (tmpTabChildren.length == 0) {
						//默认的导航
						tmpTabChildren = [this.aiChatAppList]
					}
					this.menuTabList = tmpTabChildren
					this.uni_setStorageSync('menuTabList', tmpTabChildren)
				}

			},

			get_ai_chat_config() {
				this.$commonApi.get_ai_chat_configs().then((res) => {
					this.uni_setStorageSync('ai_chat_config', res)
					this.showChat = true
					for (let s of res) {
						if (s.key == 'is_show_home' && !s.val) {
							this.showChat = false
							break
						}
					}
					// #ifdef H5 || APP
					this.showChat = true
					// #endif
					this.ai_chat_wx_qr_code = ''
					for (let s of res) {
						if (s.key == 'ai_chat_wx_qr_code') {
							this.ai_chat_wx_qr_code = s.val
							break
						}
					}
					this.isNotShowHomeJoin = this.$commonApi.configs.isNotShowHomeJoin
					this.beianhao = this.$commonApi.configs.beianhao || ''
					this.noticeBar = this.$commonApi.configs.noticeBar || ''
					this.banners = (this.$commonApi.configs.index_banners || '').split(',')
					if (!this.banners[0]) {
						this.banners = []
					}
				})
			},

			async getTemplateList() {
				let ai_chat_app_list = await this.$commonApi.callFunctionAsync('ai-chat-app-list')
				let tmpMenus = []
				if (ai_chat_app_list && ai_chat_app_list.result && ai_chat_app_list.result.length > 0) {
					for (let item of ai_chat_app_list.result) {
						let ii = 0
						let tmpArrs = []
						for (let s of item.menus) {
							s.index = ii
							// #ifdef H5
							s.onlyH5 = false
							// #endif
							if (s.onlyH5) {
								continue
							}
							tmpArrs.push(s)
							ii++
						}
						item.menus = tmpArrs
						tmpMenus.push(item)
					}
				}
				this.aiChatAppList = tmpMenus
				this.uni_setStorageSync('ai_chat_app_list', tmpMenus)
				this.iniData()
			},
			get_moduleList_array(size) {
				let pages = Math.ceil(this.moduleList.length / size)
				let items = []
				for (var i = 0; i < pages; i++) {
					items.push(this.moduleList.slice(i * size, (i + 1) * size))
				}
				return items
			},
			selectModule() {
				this.$refs.selectModuleDialog.open()
			},
			clickCtTab(ctCur) {
				this.tabCur = ctCur
			},

			inputDialogOpen() {
				this.$refs.inputDialog.open()
			},

			dialogInputConfirm(e) {
				if (!this.$commonApi.isInCurrentPage('pages/home/home')) {
					return
				}
				let user = this.uni_getStorageSync('user');
				this.$commonApi.redeemMember({
					openid: user.openid,
					code: e
				}).then((res) => {
					if (res.code == 200) {
						this.userInfo()
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},

			homeMore() {
				let that = this
				let itemList = ["兑换码加次数", '加入微信群']

				uni.showActionSheet({
					itemList: itemList,
					success: function(res) {
						switch (res.tapIndex) {
							case 0:
								that.inputDialogOpen()
								break;
							case 1:
								that.kefuDialogShow()
								break;

						}
					},
					fail: function(res) {
						console.log(res.errMsg);
					}
				});
			},
			kefuDialogShow() {
				this.previewImage()
				return
				this.$refs.kefuDialog.open()
			},
			toModule(item) {
				let is_login = this.$commonApi.is_login()
				if (!is_login) {
					return
				}
				//判断模型是否vip用户才能用
				if ((item.isvip && !this.$commonApi.is_vip_user())) {
					uni.showModal({
						title: "温馨提醒", // 标题  
						content: "付费用户才能使用该模型提问哦", // 内容  
						showCancel: true, // 可以不要  
						confirmText: "立即充值",
						success: (res) => {
							if (res.confirm) {
								uni.navigateTo({
									url: "/pages/vip/vip?from=charge"
								})
							} else {
								reject()
							}
						}
					})
					return
				}

				let that = this
				this.uni_setStorageSync('menu_select', item)
				if (that.isToChatInnerPage) {
					uni.navigateTo({
						url: '/pages/ai/ai_chat_in?title=' + item.title + '&index=' + item.index
					})
				} else {
					uni.navigateTo({
						url: '/page_1/pages/home/chat?title=' + item.title + '&index=' + item.index
					})
				}
			},
			userInfo() {
				let isLogin = this.$commonApi.get_user_token()
				if (!isLogin) {
					return false
				}
				this.$commonApi.user({
					action: 'checkToken'
				}).then((res) => {
					res.openid = this.$commonApi.get_openid()
					this.user = res
					this.uni_setStorageSync('user', this.user);
				})
			},


		},

	}
</script>

<style lang="scss" scoped>
	@import "@/pages/home/home.scss";
</style>