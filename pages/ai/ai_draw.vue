<template>
	<view id='box' :data-theme="state.app.theme" class="drawPage">

		<!--自定义 header -->
		<view class="dialog-item-top" v-if="showChat && isShowHeader" :style="{ paddingTop: 0 + 'px' }">
			<view class="menu-icon" style="margin-right: 22px;">
				<image class="menu-icon" v-show="isOpenDrawImage" @click="changeType" src="/static/chat/left_more.png">
				</image>
			</view>
			<view class="dialog-item-tel">{{chatTypeDesc}} <text v-if="chatType!=2">({{gpt_version}})</text></view>

		</view>
		
		<view class="ai-chat-css" >
			
			<view id="chatBox" class="ai-chat-css-image" v-if="showChat && (!isShowSelectTemplate || templateList.length==0)">
				<view class="chat" v-if="showChat" :style="{paddingTop: statusBarHeight  + 'px'}">
					<mescroll-body style="margin-bottom: 50px" ref="mescrollRef" :auto="false" @init="mescrollInit"
						:down="downOption" @down="downCallback" :up="upOption" @up="upCallback">
						<view class="chat-item" v-for="(item, index) in chat" :key="index">
							<!-- 问题框 -->
							<u-transition :show="true" mode="fade-right" v-if="item.problem">
								<view class="chat-item__right">
									<view class="chat-item__right-message line_text" @tap="copy(item.problem,index)">
										<u-parse :content="getContent(item.problem)"></u-parse>
									</view>
									<u-avatar size="30" class="avatarCss" shape="circle" :src="client_avatar"></u-avatar>
								</view>
							</u-transition>
							<!-- 答案框 -->
							<u-transition :show="true" mode="fade-left" v-if="item.answer">
								<view class="chat-item__left u-flex">
									<u-avatar :src="aiAvatar" size="30" class="avatarCss" shape="circle"></u-avatar>
									<view class="chat-item__left-right">
										<view class="chat-item__left-name"> {{ai}} </view>
										<view class="chat-item__left-bottom ">
											<view>
												<view class="chat-item__left-message">
													<text v-if="item.answer == 'error'">网路错误</text>
			
													<view class="content">
														<ai-chat-uni-msg style="overflow-x: auto;"
															v-if="item.answer != 'error' && isImage(item.answer)==false "
															@tap="copy(item.answer,index)" :md="encodeHtml(item.answer)"
															:show-cursor="index == chat.length-1"></ai-chat-uni-msg>
													</view>
													<image @click="previewImage(item.answer)" v-if="isImage(item.answer)"
														:src="item.answer" mode="widthFix" width="300"></image>
																								
													<view v-if="isImage(item.answer)" class="imageBox">
														<text v-if="item.isThumb">放大<uni-icons type="help" color="#686efe"
																size="20"
																@click="showToast('对图片进行进行放大,获取原图')"></uni-icons></text>
														<view v-if="item.isThumb"
															@click="setImageEngineData('upscale',1,item)"
															class="imageVariant">左上
														</view>
														<view v-if="item.isThumb"
															@click="setImageEngineData('upscale',2,item)"
															class="imageVariant">右上
														</view>
														<view v-if="item.isThumb"
															@click="setImageEngineData('upscale',3,item)"
															class="imageVariant">左下
														</view>
														<view v-if="item.isThumb"
															@click="setImageEngineData('upscale',4,item)"
															class="imageVariant">右下
														</view>
														<u-icon v-if="item.isThumb"
															@click="setImageEngineData('imagine',0,item)" size="30"
															name="reload"></u-icon>
													</view>
													<view v-if="isImage(item.answer)" class="imageBox">
														<text v-if="item.isThumb">变体<uni-icons type="help" color="#686efe"
																size="20"
																@click="showToast('对图片进行多样化修改')"></uni-icons></text>
														<view v-if="item.isThumb"
															@click="setImageEngineData('variation',1,item)"
															class="imageVariant">左上
														</view>
														<view v-if="item.isThumb"
															@click="setImageEngineData('variation',2,item)"
															class="imageVariant">右上
														</view>
														<view v-if="item.isThumb"
															@click="setImageEngineData('variation',3,item)"
															class="imageVariant">左下
														</view>
														<view v-if="item.isThumb"
															@click="setImageEngineData('variation',4,item)"
															class="imageVariant">右下
														</view>
													</view>
			
												</view>
											</view>
											<u-loading-icon v-if="!item.answer"></u-loading-icon>
											<u-icon v-if="item.answer == 'error'" name="error"></u-icon>
			
											<view style="margin-top:auto;" v-if="true">
												<image v-if="!isStopChat && isStopChatIndex==index"
													@click="stopChat(item,index)" src="/static/common/stop.png" mode="widthFix"
													style="width: 25px;"></image>
											</view>
										</view>
										<view style="margin-top:5px;" v-if="!isImage(item.answer)">
											<image @tap="copy(item.answer,index)" src="/static/common/copy.png"
												mode="widthFix" style="height: 25px;width:25px"></image>
										</view>
			
										<view style="margin-top:5px;" v-if="isImage(item.answer)">
											<image @tap="downloadFile(item.answer)" src="/static/chat/down.png"
												mode="widthFix" style="height: 40px;width:40px"></image>
										</view>
			
									</view>
								</view>
							</u-transition>
						</view>
						<view class="seize" style="height: 60px"></view>
					</mescroll-body>
			
				</view>
			</view>
		</view>

		<!-- 选择文案 -->
		<view id="templateBox" v-if="showChat && (isShowSelectTemplate &&  templateList.length>0)">

			<view id="scroll-view-content" class="msg-mains">
				<view>
					<view class="chat-app-tel">AI聊天机器人</view>

					<view class="chat-tips-item">
						<text>向我提问、切换模型</text>
						<view class="trade-item">
							<text @click="randTemplate">换一批</text>
							<u-icon size="20" name="reload" @click="randTemplate"></u-icon>

							<text @click="changeChatVersion">切换</text>
							<u-icon style="margin-left:5px;" color="#686efe" size="20" name="setting"
								@click="changeChatVersion"></u-icon>
						</view>

					</view>



					<view class="flex-container">
						<view class="flexbox-item" v-for="(m,i) in randTemplateList" @click="changeModule(m)">
							<text class="text">{{replaceChatGptStr(m.title)}}</text>
						</view>
					</view>




				</view>
			</view>

		</view>
		<!-- 文案结束 -->

		<!-- 底部输入框 -->
		<view class="chat-setting" v-if="chatTypeFlag=='image' && user">

			<view v-if="imageEngine=='MJ'" style="color: rgb(153, 153, 153);">
				剩余{{(user.number_draw||0)<=0?0:user.number_draw}}次</view>
			<view v-if="imageEngine=='openAi'" style="color: rgb(153, 153, 153);">
				剩余{{user.number<=0?0:user.number}}次</view>

		</view>

		<view class="input-box" v-if="true">

			<view id='moreModule' v-if="true">
				<image src="/static/chat/change.png" mode="widthFix" style="width:33px;height:33px;"
					@tap="selectModule2"></image>
			</view>
			<view style="flex: 1;margin-right: 10rpx;">
				<view v-if="false" style="margin-bottom: 2px;">内容为AI模型生成，内容不准确敬请谅解</view>
				<view class="textarea">

					<textarea class="u-textarea"
						style="width: 90%;height:25px;border-radius: 7px;border: 1px solid #ddd;padding:8px;"
						:maxlength="ai_chat_msg_max_length" ref="chatBox" v-model="problem" :placeholder="placeholder"
						border="surround"></textarea>

				</view>
			</view>
			<view style="margin-right: 5rpx;">
				<view id="submit_msg" v-if="chatTypeFlag=='image'">
					<image mode="widthFix" style="width: 35px;height: 35px; " @click="getAnswer"
						src="/static/tabbar/draw2.png"></image>
				</view>
			</view>



		</view>

		<uni-popup ref="selectModuleDialog" type="dialog">
			<view class="selectModuleDialog uni-padding-wrap uni-common-mt"
				style="max-height: 800rpx;margin-top: 100rpx;overflow-y: auto;">
				<text ref="selectModuleDialog" @click="changeModule(item)"
					v-for="item in templateList">{{replaceChatGptStr(item.title)}}</text>
			</view>
		</uni-popup>



		<uni-drawer ref="create_chat_Dialog" mode="left" :mask="false" :mask-click="true">
			<view class="dialog-main" style="background:#202123">
				<view class="dialog-main-mav" @click="addChat">
					<image class="dialog-main-add" src="/static/chat/btn_add.png">
					</image>
					<view class="dialog-main-tel">创建新绘画</view>
				</view>
				<scroll-view style="height: 540px;" scroll-y>
					<view class="scroll-view">
						<view class="scroll-view-content">
							<view class="dialog-main-list">
								<view
									:class="chatDialogsIndex==index?'dialog-main-item dialog-main-sels':'dialog-main-item'"
									v-for="(item,index) in chatDialogs" :key="index">

									<view class="draw-msg-icon" @click="selChatDialog(item,index)">
										<image class="draw-msg-icon" src="/static/chat/draw_left1.png">
										</image>
									</view>
									<view class="dialog-msg-text " @click="selChatDialog(item,index)">{{item.title}}
									</view>

									<view class="dialog-del-icon " style="margin-left:20px;"
										@click="editChatDialogOpen(item,index)">
										<image class="dialog-del-icon" src="/static/chat/update.png">
										</image>
									</view>

									<view class="dialog-del-icon " @click="delChatDialog(item,index)">
										<image class="dialog-del-icon" src="/static/chat/btn_del.png">
										</image>
									</view>

								</view>

							</view>
						</view>
					</view>
				</scroll-view>
				<view class="dialog-main-boom">
					<view class="dialog-boom-item" @click="clearAllChat">
						<image class="dialog-main-add" src="/static/chat/btn_del.png">
						</image>
						<view class="dialog-main-tel">清空绘画记录</view>
					</view>
				</view>
			</view>
		</uni-drawer>


		<uni-popup ref="editChatDialog" type="dialog">
			<uni-popup-dialog ref="inputClose" mode="input" title="输入绘画记录标题" placeholder="请输入唯一标题"
				v-model="chatDialogsTitle" @close="editChatDialogCancel"
				@confirm="editChatDialogConfirm"></uni-popup-dialog>
		</uni-popup>

	</view>

</template>

<script>

	let videoAd = null;
	import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";


	let answer0 = '多个关键词可用逗号拼接\n'
	answer0 += '\n画面描述以短句、短语为佳\n'

	function getTimer() {
		var time = new Date();
		var h = time.getHours();
		h = h < 10 ? '0' + h : h;
		var m = time.getMinutes();
		m = m < 10 ? '0' + m : m;
		var s = time.getSeconds();
		s = s < 10 ? '0' + s : s;
		return h + ':' + m + ':' + s + ":" + time.getMilliseconds();
	}
	//日志输出
	const console_log = function(data) {
		if (!process.env.NODE_ENV || process.env.NODE_ENV != 'development') {
			return
		}
		let content = ''
		content = typeof data == 'object' ? JSON.parse(data) : data
		console.log('\n日志时间：' + getTimer() + '\r\n内容:' + content)
	}

	export default {
		mixins: [MescrollMixin],

		data() {
			return {
				chatBoxHeight: 20,
				ai: '',
				problem: '',
				answer: '',
				module: '',
				templateList: [],
				show: false,
				key: '',
				chat: [],
				type: 'chat',
				nomore: false,
				pagenum: 1,
				upOption: {
					use: false,
					noMoreSize: 0
				},
				downOption: {
					auto: false
				},
				user: {},
				//默认上下文绘画
				chatType: 2,
				lastHistoryIndex: 1,
				openai_end: false,
				client_avatar: '',



				show: false,
				isday: 0,
				isnum: 5,
				invite: 0,
				freePerDay: 0,

				openid: '',
				obj: {},
				id: '',

				openData: [],
				systemRole: '',
				placeholder: '请输入绘画关键词',

				websock: null,
				websock_retry_times: 0,
				lockReconnect: false,
				allContent: '',
				allContentError: '', //新增

				heartbeatTimer: null, //心跳检测
				reconnectTimer: null, //重连

				is_submit_question: false,

				//是否显示
				showChat: true, //显示头部导航
				ai_chat_wx_qr_code: '',
				chatTypeDesc: 'AI绘画',
				chatTypeFlag: 'image', //chat：文字 image：绘图
				isOpenDrawImage: false, //开启绘图

				isShowHeader: true, //显示头部

				isShowSelectTemplate: false, //默认显示聊天文案

				randTemplateList: [], //随机口令
				groupTemplateNameSelect: 0, //默认分组名称
				groupTemplateNames: [], //口令分组名称
				groupTemplateList: [], //每个口令的数组数据

				chatTitle: '', //聊天标题，用来加载换成用
				aiAvatar: '/static/logo.png', //机器人头像

				ai_chat_key_word_list: [], //回复关键词

				isStopChat: true, //暂停打印功能
				isStopChatIndex: -1, //暂停打印功能
				statusBarHeight: 0,
				ai_chat_msg_max_length: 2000,

				timer_gpt_reply: null, //gpt超时定时器
				gpt_reply_log_id: '', //gpt日志id
				scrollMsgTimes: 0, //滚动条间隔时间
				state: {},
				//5.19
				option: {},
				is_unload_close_websocket: false, //是否退出页面后关闭wss
				promptTemplate: '', //prompt模板

				//绘画参数
				imageEngine: 'openAi',
				imageEngineAction: 'imagine',
				imageEngineIndex: 0,
				imageEngineImageId: '',
				imageEngineImageUrl: '', //垫图专用
				imageEngineSize: '1:1', //图片尺寸

				chatDialogsIndex: 0,
				chatDialogsTitle: '',
				chatDialogs: [],
				configs: {},

				//授权登录
				wx_code: '',
				inviteCode: '',
				is_weixin_brwser: false,

				gpt_version: 'AIChat 3.5', //选中的模型
				cur_cost: 1,
			}
		},
		onShow() {
			//是否进入pc绘画 6.17
			// #ifdef H5
			if (uni.getSystemInfoSync().platform == 'windows' &&
				this.$commonApi.configs.is_open_pc_draw) {
				//是否进入pc版本绘画页面（需要的走定制开发）
				uni.navigateTo({
					url: '/page_draw/pages/picture/index'
				})
				return
			}
			// #endif
			
			let option = this.option
			if (this.$commonApi.isInCurrentPage('/ai/ai_chat')) {
				if (!this.isShowHeader) {
					this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 50
				} else {
					//pc 高度需要+50
					if (uni.getSystemInfoSync().osName == 'windows') {
						this.statusBarHeight = 80
					}
				}

			} else {
				this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 10
				//pc 高度需要+50
				if (uni.getSystemInfoSync().osName == 'windows') {
					this.statusBarHeight = 50
				}
			}

			this.get_ai_chat_config()
			if (!option || !option.title) {
				let tmpAvatar = this.$commonApi.configs.aiAvatar || '/static/logo.png'
				this.aiAvatar = tmpAvatar

			}

			if (!option || !option.title) {
				let tmpAnswer = this.$commonApi.configs.drawPromptDefault || answer0
				answer0 = tmpAnswer
			}

			let _index = 0
			this.$set(this.chat, _index, {
				...this.chat[_index],
				answer: answer0
			});

			this.initWebSocket()

			// #ifndef MP
			this.showChat = true
			// #endif
			//检测用户是否登录
			let user = this.uni_getStorageSync('user');
			this.user = user;
			this.getTemplateList()

			if (!this.$commonApi.get_user_token()) {
				//登录系统
				//return false
			}
			this.getAiChatKeywords()
			this.userInfo()
		},
		onShareAppMessage: function() {
			let user = this.uni_getStorageSync('user');

			this.$commonApi.addNumber({
				openid: user.openid,
				number: this.$commonApi.configs.shareAppNumber || 1
			}).then((resuls) => {
				console_log(resuls);
			})

			return {
				title: this.$commonApi.getShareTitle(),
				path: '/pages/home/home?type=haoyou&inviteCode=' + user.my_invite_code,
				success: function(e) {

				}
			};
		},
		onShareTimeline: function() {
			let user = this.uni_getStorageSync('user');
			this.$commonApi.addNumber({
				openid: user.openid,
				number: this.$commonApi.configs.shareAppNumber || 1
			}).then((resuls) => {
				console_log(resuls);
			})

			return {
				title: this.$commonApi.getShareTitle(),
				path: '/pages/home/home?type=pengyouquan&inviteCode=' + user.my_invite_code,
				success: function(e) {

				}
			};
		},
		onUnload() {
			if (!this.is_unload_close_websocket) {
				return
			}
			if (this.$commonApi.chat_type() == 'socket') {
				if (this.websock != null) {
					this.websock.close()
					this.websock = null
				}
			}
			clearInterval(this.reconnectTimer)
			clearInterval(this.heartbeatTimer)
		},
		onPullDownRefresh() {
			this.get_ai_chat_config()
		},
		onReady() {},
		async onLoad(option) {
			this.option = option
			this.state = this.$store.state
			this.$commonApi.save_share_invite_code(option.inviteCode || '')
			this.inviteCode = this.$commonApi.get_share_invite_code()
			await this.get_ai_chat_config()
			//是否进入pc绘画 6.17
			// #ifdef H5
			if (uni.getSystemInfoSync().platform == 'windows' &&
				this.$commonApi.configs.is_open_pc_draw) {
				//是否进入pc版本绘画页面（需要的走定制开发）
				uni.navigateTo({
					url: '/page_draw/pages/picture/index'
				})
				return
			}
			// #endif

			this.$commonApi.autoAuthLogin()

			this.$commonApi.reLoadConfig()

			this.chatDialogs = this.uni_getStorageSync('drawDialogData') || []

			//h5自动登录
			this.$commonApi.autoAuthLogin()

			//默认绘画引擎
			if (this.$commonApi.configs.draw_way_mj) {
				this.imageEngine = 'MJ'
				this.cur_cost = this.$commonApi.configs.draw_cost_mj || 10
			}

			this.isShowHeader = true
			if (option && option.title) {
				uni.setNavigationBarTitle({
					title: option.title || ''
				})
				this.chatTypeDesc = option.title
				this.is_unload_close_websocket = true
				this.isShowHeader = false
				this.setChatType(0)
			} else {
				this.setChatType(this.chatType)
			}

			this.ai_chat_msg_max_length = this.$commonApi.configs.ai_chat_msg_max_length || 2000
			let tmpAnswer = this.$commonApi.configs.drawPromptDefault || answer0
			answer0 = tmpAnswer


			//检测用户是否登录
			let user = this.uni_getStorageSync('user');
			this.user = user
			//登录才进行连接
			if (this.$commonApi.chat_type() == 'socket' && user) {
				this.initWebSocket()
				//监听
				this.reconnectTimer = setInterval(() => {
					if (this.websock != null && this.websock.readyState > 1) {
						//this.reconnect()
					}
					if (this.websock != null && this.websock.readyState != 1) {
						console_log('readyState:' + this.websock.readyState);
					}
				}, this.websock_retry_times % 5 == 1 ? 3000 : 6000)

				this.heartbeatTimer = setInterval(() => {
					if (this.websock != null) {
						this.websock.send({
							data: 'ping'
						})
					}
				}, 10000)

			}

			this.initChatData(option)

			//旧版本需要加载appkey，新版本不用
			//this.getChat()
			this.adLoad()
			
			// #ifdef H5
			//当前页面才生效
			let _cur_page='ai/ai_draw'
			if (this.$commonApi.isInCurrentPage(_cur_page)) {
				document.onkeydown = event => {
					var e = event || window.event;
					if (e  && e.shiftKey && e.keyCode == 13) { //回车键的键值为13
						this.getAnswer()
					}
				};
			}
			// #endif
			
		},
		watch: {
			problem(val) {
				if (val.length > 50 || val.indexOf('\n') > -1) {
					this.chatBoxHeight = 50 * (val.length / 50)
				} else {
					this.chatBoxHeight = 20
				}
				if (this.chatBoxHeight <= 0) {
					this.chatBoxHeight = 20
				} else if (this.chatBoxHeight > 500) {
					this.chatBoxHeight = 500
				}
			}
		},
		methods: {
			changeImageEngine() {
				let configs = this.$commonApi.configs
				let that = this
				let itemList = ['OPENAI DALL·E2(每次' + (configs.draw_cost_openai || 1) + '条)']
				if (configs.draw_way_mj) {
					itemList = []
					itemList.push('Midjourney 绘画引擎(每次' + (configs.draw_cost_mj || 10) + '条)')
					itemList.push('OPENAI DALL·E2(每次' + (configs.draw_cost_openai || 1) + '条)')
				}
				uni.showActionSheet({
					itemList: itemList,
					success: function(res) {
						let cur = itemList[res.tapIndex]
						if (cur.indexOf('Midjourney') > -1) {
							that.imageEngine = 'MJ'
							that.cur_cost = that.$commonApi.configs.draw_cost_mj || 10
						} else if (cur.indexOf('OPENAI') > -1) {
							that.imageEngine = 'openAi'
							that.cur_cost = that.$commonApi.configs.draw_cost_openai || 1
						} else {
							that.imageEngine = 'openAi'
							that.cur_cost = that.$commonApi.configs.draw_cost_openai || 1
						}
						that.setChatType(2)
					},
					fail: function(res) {
						console_log(res.errMsg);
					}
				});
			},
			setImageEngineSize() {
				let that = this
				let itemList = ['1:1', '1:2', '3:4', '9:16', '16:9']
				uni.showActionSheet({
					itemList: itemList,
					success: function(res) {
						that.imageEngineSize = itemList[res.tapIndex]
					},
					fail: function(res) {}
				});
			},
			async setImageEngineData(action, index, item) {
				let that = this
				this.imageEngine = 'MJ'
				this.imageEngineAction = action || 'imagine'
				this.imageEngineIndex = index || ''
				this.imageEngineImageId = item.imageId
				this.problem = item.problem

				this.setChatType(2)
				let tip = ''
				switch (action) {
					case 'imagine': //生成4张图
						this.imageEngineImageId = ''
						tip = ''
						break
					case 'upscale': //放大图片
						this.imageEngineImageUrl = ''
						tip = '正在生成大图，大概1分钟，请耐心等待'
						break
					case 'variation': //垫图
						tip = '正在以图生图，大概1分钟，请耐心等待'
						break
				}
				that.imageEngineImageUrl = ''
				that.drawImage(item.problem, tip)
			},
			get_task_result(task_id) {
				return this.$commonApi.ai_chat_draw(task_id ? 'image_result' : 'start_draw_timer', {}, task_id, this.imageEngine)
			},
			getAnswerContent(answer) {
				return this.chatTypeFlag != 'image' ? (answer || "思考中,请稍等......") : (answer || 'ai绘图中，请稍后')
			},
			encodeHtml(html) {
				return encodeURIComponent(html)
			},
			getContent(content) {
				return this.$commonApi.getContent(content)
			},
			initChatData(option) {
				if (!option || !option.title) {
					option = {
						title: this.chatDialogs.length == 0 ? '新建绘画1' : this.chatDialogs[0].title
					}
				}
				let menu_select = this.uni_getStorageSync('menu_select')
				menu_select = null
				//menu_select
				let isFromIndex = menu_select && option && option.index
				if (isFromIndex) {
					answer0 = menu_select.description
					this.aiAvatar = menu_select.url
					this.setPlaceHolder(menu_select.placeholder)

					//从应用模块进来绘画(5.20)
					if (!this.$commonApi.configs.is_not_chat_with_template) {
						//默认是以模板进行提问
						this.systemRole = menu_select.systemRole
						this.promptTemplate = menu_select.promptTemplate || ''
					}
				} else {
					this.setPlaceHolder(null)
				}
				this.answer = answer0
				this.chatTitle = option.title || menu_select.title

				let msg_title_id = this.$commonApi.MD5(this.chatTitle)
				this.lastHistoryIndex = this.uni_getStorageSync('ai_chat_draw_his_last_id' + msg_title_id) || 1

				let tmp = this.uni_getStorageSync('ai_chat_draw_his' + msg_title_id)

				//查下数据库
				let where = {}
				where['user_uuid'] = this.user.uid
				let orderBy = '_id asc'
				let client_avatar = this.user.client_avatar
				let begin = new Date().getTime()
				this.$commonApi.callFunctionAsync('ai-chat-draw-his', {
					data: where,
					'is_encry_req': 1,
					'pageCurrent': 1,
					'pageSize': 50,
					'orderBy': orderBy
				}).then((res) => {
					tmp = []
					let end = new Date().getTime()
					//console.log('完成请求'+(end-begin)+'毫秒')
					if (res.result && res.result.length > 0) {
						for (let item of res.result) {
							let answer = item.thumb_image_path || ('绘画失败 ' + (item.msg || ''))
							if (item.status == -1) {
								answer = '绘画中，请稍后'
							}
							let prompt = item.prompt && item.prompt.prompt ? item.prompt.prompt : item.prompt
							if (typeof prompt != 'string') {
								prompt = ''
							}
							tmp.push({
								problem: (prompt).split('--ar')[0] || '',
								answer: answer,
								type: 'image',
								imageId: item.image_id,
								isThumb: item.image_id, //缩略图
								client_avatar: client_avatar
							})
						}
					}
					//先清空
					this.chat = []
					if (!tmp || tmp.length == 0) {
						this.chat.push({
							problem: '',
							save: false,
							answer: this.answer
						});

					} else {
						for (var item of tmp) {
							this.chat.push(item)
						}
						if (tmp.length > 10) {
							uni.pageScrollTo({
								scrollTop: 999999, // 设置一个超大值，以保证滚动条滚动到底部
								duration: 0
							});
						}
					}
				})


			},
			replaceChatGptStr(str) {
				return (str || '').replace(/(chatgpt|gpt|openai)/gi, '')
			},
			setChatType(type) {
				let that = this
				switch (type) {
					case 0:
						this.chatType = type
						this.chatTypeDesc = '创作'
						this.chatTypeFlag = 'chat'
						break
					case 1:
						this.chatType = type
						this.chatTypeDesc = '聊天绘画'
						this.chatTypeFlag = 'chat'
						break
					case 2:
						this.chatType = type
						this.chatTypeFlag = 'image'
						this.chatTypeDesc = 'AI绘画' + '(' + that.imageEngine + ')'
						break
				}
			},
			changeType() {
				this.$refs.create_chat_Dialog.open()
				return

				let that = this
				let itemList = ["文字绘画", "AI绘画"]
				uni.showActionSheet({
					itemList: itemList,
					success: function(res) {
						switch (res.tapIndex) {
							case 0:
								that.chatTypeDesc = '聊天绘画'
								that.chatTypeFlag = 'chat'
								that.setPlaceHolder('请输入聊天内容')
								break;
							case 1:
								that.chatTypeDesc = 'AI绘画' + '(' + that.imageEngine + ')'
								that.chatTypeFlag = 'image'
								that.setPlaceHolder('比如：画一幅风景图')
								break;
						}

						uni.setNavigationBarTitle({
							title: that.chatTypeDesc
						})

					},
				})
			},
			setPlaceHolder(ai_chat_placeholder) {
				ai_chat_placeholder = ai_chat_placeholder || '请输入绘画关键词'
				let placeholderTmp = ai_chat_placeholder.split('')
				let i = 0
				let that = this
				that.placeholder = ''
				let placeholderTimer = setInterval(function() {
					if (i > placeholderTmp.length - 1) {
						return
					}
					that.placeholder += placeholderTmp[i]
					i++
				}, 50)
				setTimeout(function() {
					clearInterval(placeholderTimer)
				}, 3000)
			},
			stopChat(item, index) {
				this.isStopChat = true
				this.isStopChatIndex = -1

				this.finishChat({
					code: 0,
					text: this.allContent.replace(/^\n|\n$/g, "")
				})

				if (this.websock) {
					this.websock.close()
					this.reconnect()
				}
			},
			onChatMessage(res) {
				let index = this.chat.length - 1
				this.isStopChatIndex = index
				//console_log('chat 页面信息')
				this.$set(this.chat, index, {
					...this.chat[index],
					answer: res.text
				});
				this.isStopChat = false
				//保存历史记录
				this.saveMsg()
				this.scrollMsg()
			},
			scrollMsg(flag) {
				this.scrollMsgTimes += 1
				if (this.scrollMsgTimes % 100 != 1 && !flag) {
					return
				}
				if (this.$commonApi.isInCurrentPage('/chat/', true)) {
					//this.mescroll.scrollTo(99999999);		
					uni.pageScrollTo({
						scrollTop: 9999999, // 设置一个超大值，以保证滚动条滚动到底部
						duration: 500
					})
				}
			},
			//问答完成
			async finishChat(res) {
				this.isStopChat = true
				if (res.code == 419) {
					//清空上下文
					this.openData = []
				}
				if (res.code == 419 && res.text.indexOf('输入的内容太长了') > -1) {
					uni.showToast({
						title: '提问内容太多了,从当前提问重新开始上下文问答',
						icon: 'none'
					})
				}

				if (res.code == 419 && res.json) {
					//更新key状态
					this.$commonApi.ai_chat_api_key_vaild({
						content: JSON.parse(res.json),
						apikey: this.apikey
					}).then((res) => {})
				}

				//处理违规返回内容
				if (this.$commonApi.ai_chat_is_check_res && this.chatTypeFlag != 'image') {
					await this.$commonApi.msgSecCheck(res.text).then((secRes) => {
						if (secRes.code != 200) {
							res.text = '返回内容不合规,' + secRes.msg
						}
					}).catch((res) => {
						res.text = '返回内容不合规'
					})
				}

				let index = this.chat.length - 1
				this.$set(this.chat, index, {
					...this.chat[index],
					answer: res.text
				});
				//保存历史记录
				this.saveMsg(res)
				this.is_submit_question = false
				if (res.code == 0) {
					if (this.chatTypeFlag != 'image') {
						//机器人回复assistant
						this.openData.push({
							"role": "assistant",
							"content": res.text
						})
					}


					//提问次数扣减
					let number = 1
					if (this.gpt_version.indexOf('4.0') > -1) {
						number = Math.abs(this.$commonApi.configs.gpt_cost_4 || 10)
					} else if (this.gpt_version.indexOf('3.0') > -1) {
						number = Math.abs(this.$commonApi.configs.gpt_cost_3 || 1)
					}
					this.$commonApi.ai_chat_reduce_use_times({
						number: number,
						data: {
							question: this.chat[index].problem,
							reply: res.text || res.msg,
						}
					}).then((res) => {
						if (this.user.isvip != 1) {
							this.user.number -= number
						}
						this.user.openNumber += 1
						this.uni_setStorageSync('user', this.user)
					})
				}
				this.scrollMsg()

			},
			initWebSocket() {
				console_log('initWebSocket：' + new Date())
				if (this.websock && this.websock.readyState == 1) {
					return
				}
				let wssUrl = this.$commonApi.get_ai_chat_wss_url()
				if (!wssUrl) {
					console_log('未配置wss')
					return
				}
				this.websock = uni.connectSocket({
					url: wssUrl,
					success: (result) => {
						//console_log('socket success');
					},
					fail: (res) => {
						//console_log('socket fail');
					}
					// 由于uni封装，必须加个回调才会返回一个SocketTask对象
				});
				this.websock.onOpen(this.websocketonopen)
				this.websock.onMessage(this.websocketonmessage)
				this.websock.onClose(this.websocketclose)
				this.websock.onError(this.websocketonerror)
			},
			websocketonopen() { 
			},
			websocket_status() {
				return this.websock != null && this.websock.readyState == 1
			},
			//5.23,发送异常会重试
			trySendMsg(encry_data) {
				let trySendMsg_timer = 10;
				let that = this
				this.$commonApi.tryFun(() => {
					that.websock.send({
						data: encry_data
					})
					return {
						code: that.websocket_status() ? 0 : 500
					}
				}, 10, 2000)
			},
			websocketSend(result) {
				if (!result) {
					return
				}
				let that = this
				//绑定账号
				result.ai_chat_wx_mp_appid = this.$commonApi.ai_chat_wx_mp_appid
				let encry_data = this.aes_encrypt(JSON.stringify(result))
				this.trySendMsg(encry_data)
				console_log('连接状态' + this.websock.readyState + '，发送文字' + new Date())
			},
			websocketonmessage(e) { // 数据接收
				this.lockReconnect = true;
				let json = e.data
				this.websock_retry_times = 0
				if (!json || json == 'pong') {
					return
				}
				//console_log(json)
				//关闭超时提醒
				if (this.timer_gpt_reply) {
					clearTimeout(this.timer_gpt_reply)
				}
				//错误信息是一次性返回的
				if (json.indexOf('"error":') > -1 && json.indexOf('"message":') > -1 && json.replace(/\n/gi, "").endsWith(
						'}')) {
					try {
						let error = JSON.parse(json)
						this.finishChat({
							code: 419,
							text: this.$commonApi.getApiError(error),
							json: json
						})
					} catch (e) {
						this.finishChat({
							code: 419,
							json: {
								error: json
							},
							text: '服务异常，请刷新页面再试'
						})
						console.log(e)
						console.log(json)
					}
					return true
				}
				if (!this.allContentError && !json.startsWith('data: ')) {
					this.finishChat({
						code: 419,
						text: json,
						json: json
					})
					return true
				}
				//wss账号到期，3.29新增
				if (json.indexOf('[WSS_EXPIRED]') > -1) {
					this.finishChat({
						code: 500,
						text: 'WSS服务到期，请联系客服处理'
					})
					return
				}

				(this.allContentError + json).split("data: ").forEach(str => {
					let line = str
					if (!line) {
						return
					}
					if (line.indexOf('[DONE]') > -1) {
						this.finishChat({
							code: 0,
							text: this.allContent.replace(/^\n|\n$/g, "")
						})
						return true
					}
					if (line.indexOf('[ERROR]') > -1) {
						this.finishChat({
							code: 500,
							text: (line).replace(/^\n|\n$/g, "")
						})
						return true
					}

					let value = str
					if (value && line.indexOf('[DONE]') == -1 && value.length > 0) {
						try {
							let tmpContent = JSON.parse(value).choices[0].delta.content;
							if (!tmpContent) {
								return true
							}
							//清除之前的异常数据
							this.allContentError = ''
							//替换关键词
							this.allContent += tmpContent
							this.allContent = (this.allContent || '').replace(/(chatgpt|gpt|openai)/gi, 'AI')
							this.onChatMessage({
								code: 0,
								text: this.allContent.replace(/^\n|\n$/g, "")
							})
						} catch (e) {
							this.allContentError += value
						}
						//
						if (this.allContentError == '') {
							return true
						}
						try {
							let tmpContent = JSON.parse(this.allContentError).choices[0].delta.content;
							if (!tmpContent) {
								return true
							}
							//清除之前的异常数据
							this.allContentError = ''
							//替换关键词
							this.allContent += tmpContent
							this.allContent = (this.allContent || '').replace(/(chatgpt|gpt|openai)/gi, 'AI')
							this.onChatMessage({
								code: 0,
								text: this.allContent.replace(/^\n|\n$/g, "")
							})
						} catch (e) {
							//console_log('chat::error:'+this.allContentError)
						}

					}
				})


			},
			websocketclose(e) { // 关闭
				console_log('wss断开了重连' + new Date());
				this.lockReconnect = false;
				this.is_submit_question = false
				this.reconnect()
			},
			websocketonerror() {
				//console_log('wss异常');
				this.lockReconnect = false;
				this.is_submit_question = false
				this.websock_retry_times += 1
			},
			reconnect() {
				if (this.websock != null && this.websock.readyState == 1) {
					console_log('wss 连接正常');
					return
				}
				this.lockReconnect = true;
				this.is_submit_question = false
				//没连接上会一直重连，设置延迟避免请求过多
				let that = this

				console_log('wss状态：' + (this.websock == null ? '未连接' : this.websock.readyState) + ',' + this
					.websock_retry_times + '次chat重连中:' + new Date());

				//关闭
				if (this.websock != null)
					this.websock.close()
				this.websock = null
				this.allContent = ''
				that.initWebSocket();
				that.lockReconnect = false;

			},

			userInfo() {
				this.$commonApi.user({
					action: 'checkToken'
				}).then((res) => {
					res.openid = this.$commonApi.get_openid()
					this.user = res
					if (!this.user.avatar) {
						this.user.avatar = '/static/common/avatar.png'
					}
					this.client_avatar = this.user.avatar
					this.uni_setStorageSync('user', this.user);
				})
			},

			focusMsg() {
				//this.chatBoxHeight=20
			},
			blurMsg() {
				//this.chatBoxHeight=20
			},
			writeContent() {
				console_log(this.problem)
			},
			selectModule() {
				this.$refs.selectModuleDialog.open()
			},
			selectModule2() {
				if (!this.$commonApi.get_user_token()) {
					//登录系统
					this.$commonApi.is_login()
					return false
				}
				let that = this
				this.isShowSelectTemplate = false

				let itemList = ['清空绘画记录']
				itemList.push('切换绘画模型及版本')
				uni.showActionSheet({
					itemList: itemList,
					success: function(res) {
						switch (res.tapIndex) {
							case 0:
								that.clearAllChat()
								
								break;
							case 1:
								that.changeImageEngine()
								
								break;
						}
					},
					fail: function(res) {
						console_log(res.errMsg);
					}
				});
			},

			saveMsg(res) {
				//找出需要保存的
				let chat_list = []
				for (var i = 0; i < this.chat.length; i++) {
					chat_list.push(this.chat[i])

				}
				let msg_title_id = this.$commonApi.MD5(this.chatTitle)
				this.uni_setStorageSync('ai_chat_draw_his' + msg_title_id, chat_list)
				this.uni_setStorageSync('ai_chat_draw_his_last_id' + msg_title_id, chat_list.length - 1)
			},
			clearMsg() {
				this.chat = []
				if (this.chatTypeFlag != 'image') {
					this.chat.push({
						problem: '',
						save: false,
						answer: answer0
					});
				}
				let msg_title_id = this.$commonApi.MD5(this.chatTitle)
				this.saveMsg()
				this.lastHistoryIndex = 0
				uni.removeStorageSync('ai_chat_draw_his_last_id' + msg_title_id)
			},
			changeModule(item) {
				//title：显示按钮
				//systemRole:固定场景
				//profile:简介
				//message:用户文案
				//isAuto:自动填充用户文案

				this.$refs.selectModuleDialog.close()
				this.systemRole = item.systemRole
				this.promptTemplate = item.promptTemplate || ''
				this.placeholder = item.placeholder || '请输入创作内容'
				if (!item.isAuto) {
					this.problem = item.message;
					uni.showToast({
						title: '请手动修改文案内容哦',
						icon: 'none'
					})
				} else {
					this.getAnswer()
				}
			},

			//长按识别二维码
			previewImage(url) {
				//获取大图
				url = url.replace('_thumb', '')
				console.log(url)
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
					this.configs = this.$commonApi.ai_chat_config_item()
					this.showChat = false
					for (let s of res) {
						//
						if (s.key == 'is_showChat' && !(!s.val)) {
							this.showChat = true
							break
						}
					}
					this.ai_chat_wx_qr_code = ''
					for (let s of res) {
						if (s.key == 'ai_chat_wx_qr_code' && s.val) {
							this.ai_chat_wx_qr_code = s.val
							break
						}
					}
					// #ifdef H5 || APP  
					this.showChat = true
					this.isOpenDrawImage = true
					// #endif

					for (let s of res) {
						if (s.key == 'systemRole' && s.val) {
							this.systemRole = s.val
							break
						}
					}

					for (let s of res) {
						if (s.key == 'isOpenDrawImage' && !(!s.val)) {
							this.isOpenDrawImage = s.val
							break
						}
					}


				})
			},

			async getTemplateList() {
				let cache = this.uni_getStorageSync('ai_chat_template')
				if (cache) {
					this.templateList = cache
				}
				let data = await this.$commonApi.callFunctionAsync('ai-chat-template')
				this.templateList = data.result
				this.uni_setStorageSync('ai_chat_template', data.result)
				this.randTemplate()
			},

			async getAiChatKeywords() {
				//获取关键词

				this.uni_setStorageSync('ai_chat_key_word', this.ai_chat_key_word_list)
			},
			adClick() {
				var that = this
				if (videoAd) {
					videoAd.show().catch(err => {
						// 失败重试
						// console_log("广告拉去失败")
						videoAd.load().then(() => videoAd.show())
					})
				}
			},
			adLoad() {
				var that = this
				// #ifdef MP-WEIXIN
				console_log('ai_chat_ad_id_reward:::' + this.$commonApi.ai_chat_ad_id_reward)
				if (wx.createRewardedVideoAd && this.$commonApi.ai_chat_ad_id_reward) {
					//let tmp_adUnitId=this.$commonApi.ai_chat_ad_id_reward
					//播放视频，激励回答次数
					videoAd = wx.createRewardedVideoAd({
						adUnitId: this.$commonApi.ai_chat_ad_id_reward
					});
					//捕捉错误
					videoAd.onError(err => {
						// 进行适当的提示
						console_log('videoAd onError', res);
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
					console_log(resuls);
				})
				user.number = user.number + addTimes;

				//视频条
				that.$commonApi.ai_chat_user_credits({
					openid: user.openid,
					number: addTimes
				}).then((resuls) => {
					console_log(resuls);
				})
				user.broadNumber = user.broadNumber + addTimes;
				this.uni_setStorageSync('user', user);
				this.user = user
			},


			getChat() {
				if (this.openai_end) {
					return false
				}
				let user = this.uni_getStorageSync('user');
				this.$commonApi.ai_chat_api_key().then((res) => {
					res.map((item, index) => {
						if (this.openai_end) {
							return false
						}
						this.openai_end = true
						this.$commonApi.openai_open({
							openid: user.openid,
							msg: '你好',
							apikey: item.apikey,
							type: 'wenda'
						}).then((result) => {
							if (result.code == 200) {
								this.apikey = item.apikey
							} else {

							}
						})
					})
				}).catch((err) => {
					console_log(err);
				})
			},
			downCallback() {
				if (this.pagenum <= 1 || this.nomore) {
					this.mescroll.endErr();
					return false;
				}
			},
			isImage(url) {
				if (!url || typeof url != 'string') {
					return false
				}
				if (!url.startsWith('http') && !url.startsWith('data:image/')) {
					return false
				}
				return true
			},
			downloadFile(url) {
				url = url.replace('_thumb', '')
				this.$commonApi.downloadImg(url)
			},
			copy(val, index) {
				let that = this
				uni.showActionSheet({
					itemList: ["复制内容", "删除内容"],
					success: function(res) {
						switch (res.tapIndex) {
							case 0:
								uni.setClipboardData({
									data: (val.replace(/^例如:/gi, '')),
									success: function() {
										uni.showToast({
											title: '复制成功',
											icon: 'none'
										})
									}
								});
								break;
							case 1:
								that.chat.splice(index, 1)
								that.saveMsg()
								break;
							case 2:
								break;
						}
					},
					fail: function(res) {
						console_log(res.errMsg);
					}
				});
			},
			getDataLength(fData) {
				if (!fData) {
					return 0
				}
				var intLength = 0
				for (var i = 0; i < fData.length; i++) {
					if ((fData.charCodeAt(i) < 0) || (fData.charCodeAt(i) > 255))
						intLength = intLength + 2
					else
						intLength = intLength + 1
				}
				return intLength
			},
			getChatMsg(lastHistoryIndex) {
				let msg = ''
				let that = this
				if (that.chatType == 0) {
					//一问一答
					msg += 'Humain:' + that.problem + '\n'
					msg += 'AI:'
					return msg
				}
				let iii = -1
				for (let s of that.chat) {
					iii++
					if (!s.save || iii <= lastHistoryIndex) {
						continue
					}
					msg += 'Humain:' + s.problem + '\n'
					msg += 'AI:' + s.answer + '\n'
				}
				msg += 'Humain:' + that.problem + '\n'
				msg += 'AI:'
				return msg
			},
		 	async drawImage(forceContent, tip) {
				let user = this.uni_getStorageSync('user');
				//是否开启提问免费 5.2
				let is_limit_chat = await this.$commonApi.is_limit_chat(this.cur_cost, this.imageEngine.toLowerCase() !=
					'openai')
				if (is_limit_chat) {
					
					let ai_chat_to_recharge_flag = this.$commonApi.ai_chat_recharge_type == 'charge' || !this.$commonApi.ai_chat_ad_id_reward
					ai_chat_to_recharge_flag = true
					if (ai_chat_to_recharge_flag) {
						uni.showModal({
							title: "温馨提醒", // 标题  
							content: this.$commonApi.configs.chargeTip || "体验额度已用完，可以联系客服购买充值绘画次数", // 内容  
							showCancel: true, // 可以不要  
							confirmText: "购买次数",
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

					return false
				}

				//画图
				if (this.is_submit_question) {
					this.problem = ""
					uni.showToast({
						title: '正在绘画,请稍后提交',
						icon: 'loading'
					})
					return
				}
				let that = this
				let problem = this.problem
				let requestChatData = {
					type: 'image',
					imagePlatform: this.imageEngine,
					data: problem,
					draw_cost: this.cur_cost,
					parms: {
						"prompt": (this.imageEngineImageUrl || '') + ' ' + (problem || forceContent) + ' --ar ' + this
							.imageEngineSize,
						"image_action": this.imageEngineAction,
						"image_index": this.imageEngineIndex || 0,
						"image_id": this.imageEngineImageId || ''
					},
					'is_encry_req': 1
				}
				this.chat.push({
					problem: this.imageEngineImageId == '' ? problem : '',
					answer: '',
					type: that.chatTypeFlag,
					client_avatar: that.user.avatarUrl
				})
				this.is_submit_question = true
				let index = this.chat.length - 1
				this.problem = ""
				this.$set(this.chat, index, {
					...this.chat[index],
					answer: !tip ? '正在绘画，大概1分钟，请耐心等待哦' : tip
				})
				this.scrollMsg()
				this.$commonApi.ai_chat_open_ai_api(requestChatData, this.gpt_version, false, this.imageEngine).then(async (res) => {
					this.is_submit_question = false
					if (res.code > 0) {
						this.$set(this.chat, index, {
							...this.chat[index],
							answer: '请稍后重试,' + (res.msg || '')
						});
						return
					}

					if (res.is_async) {
						this.$set(this.chat, index, {
							...this.chat[index],
							answer: '提交绘画请求成功，大概1分钟，请耐心等待哦'
						})

						//异步显示，定时查下结果5.30
						let timer_count = 0
						let timer_result = setInterval(() => {
							this.get_task_result(res.text.id).then((
								pic) => {
								timer_count++
								if (timer_count > 30) {
									this.$set(this.chat, index, {
										...this.chat[index],
										answer: '长时间没有绘图结果，请稍后重试'
									});
									clearInterval(timer_result)
								}
								if (pic.text.data.data.status == 1) {
									clearInterval(timer_result)
									this.$set(this.chat, index, {
										...this.chat[index],
										answer: pic.text.data.data.ImagePath,
										type: that.chatTypeFlag,
										imageId: pic.text.data.data.imageId,
										isThumb: that.imageEngineAction ==
											'imagine', //缩略图
										client_avatar: that.user.avatarUrl
									});
									that.saveMsg(that.chat[index])
									uni.showToast({
										title: '恭喜 绘画完成，看看效果吧'
									})

								} else if (pic.text.data.data.errMsg) {
									clearInterval(timer_result)
									this.$set(this.chat, index, {
										...this.chat[index],
										answer: '请稍后重试,' + pic.text.data.data.errMsg,
										type: that.chatTypeFlag,
										imageId: '',
										client_avatar: that.user.avatarUrl
									});
								}
							})
						}, 5000)
						return
					}

					if (res.code == 0) {
						let urls = res.text
						for (let s of urls) {
							//检测图片
							if (this.$commonApi.is_check_image_result && this.chatTypeFlag == 'image') {
								await this.$commonApi.mediaSecCheck(s.url).then((secRes) => {
									if (secRes.code != 200) {
										s.url = '生成的图片不合规,' + secRes.msg
									}
								}).catch((res) => {
									s.url = '生成的图片不合规'
								})
							}
							if (!s.url.startsWith('http')) {
								that.chat.push({
									problem: '',
									answer: s.url,
									type: that.chatTypeFlag,
									client_avatar: that.user.avatarUrl
								})
								that.saveMsg(this.chat[index])
							} else {
								//换算为base64
								that.chat.push({
									problem: '',
									answer: s.url,
									type: that.chatTypeFlag,
									client_avatar: that.user.avatarUrl
								})
								let indexNew = index + 1
								that.$commonApi.imgToBase64(s.url).then((base64Data) => {
									that.$set(that.chat, indexNew, {
										...that.chat[indexNew],
										answer: base64Data,
									});
									that.saveMsg(this.chat[index])
								}).catch((err) => {
									that.saveMsg(this.chat[index])
								})

							}
						}
						this.$set(this.chat, index, {
							...this.chat[index],
							answer: '绘图成功，请点击保存'
						});

						//保存历史记录
						this.scrollMsg()

					} else {
						//移出失败的
						this.openData.splice(this.openData.length - 1, 1)
						this.$set(this.chat, index, {
							...this.chat[index],
							answer: res.text
						});
						this.scrollMsg()
					}
				}).catch((err) => {
					this.is_submit_question = false
					this.$set(this.chat, index, {
						...this.chat[index],
						answer: '绘图失败,请稍后再试!'
					});
				})
			},
			//打字机输出
			showContentSlow(content) {
				let placeholderTmp = content
				let i = 0
				let that = this
				let result = ''
				uni.pageScrollTo({
					scrollTop: 9999999, // 设置一个超大值，以保证滚动条滚动到底部
					duration: 0
				})
				let placeholderTimer = setInterval(function() {
					if (i > placeholderTmp.length - 1) {
						clearInterval(placeholderTimer)
						return
					}
					result += placeholderTmp[i]
					let index = that.chat.length - 1
					that.$set(that.chat, index, {
						...that.chat[index],
						answer: result
					});

					i++
				}, 50)
				uni.pageScrollTo({
					scrollTop: 9999999, // 设置一个超大值，以保证滚动条滚动到底部
					duration: 0
				})

				setTimeout(function() {
					clearInterval(placeholderTimer)
				}, 5000)
			},

			async getAnswer() {
				var that = this;
				if (!this.$commonApi.get_user_token()) {
					//登录系统
					this.$commonApi.is_login()
					return false
				}

				if (that.problem.trim() == '') {
					uni.showToast({
						title: '请输入内容哦',
					});
					return false;
				}
				this.isShowSelectTemplate = false


				//校验gpt关键词
				let errorPrompt = this.$commonApi.getGptDefaultPrompt(this.problem)

				if (errorPrompt) {
					this.chat.push({
						problem: that.problem,
						answer: '',
						type: that.chatTypeFlag,
						client_avatar: that.user.avatarUrl
					})
					this.showContentSlow(errorPrompt)
					this.problem = ''
					return
				}

				if (this.is_submit_question) {
					uni.showToast({
						title: '请稍等，AI还在思考...',
						icon: 'none'
					});
					setTimeout(() => {
						this.is_submit_question = false
					}, 5000)
					return false;
				}

				if (!this.problem) {
					uni.showToast({
						title: '你还没有输入问题呢！',
						icon: 'none'
					});
					return false
				}
				
				this.scrollMsg()
				if (this.chatTypeFlag == 'image') {
					this.drawImage()
					return
				}

				let user = this.uni_getStorageSync('user');
				//是否开启提问免费 5.2
				let is_limit_chat = await this.$commonApi.is_limit_chat(this.cur_cost, this.imageEngine.toLowerCase() !=
					'openai')
				if (is_limit_chat) {
					let ai_chat_to_recharge_flag = this.$commonApi.ai_chat_recharge_type == 'charge' || !this.$commonApi.ai_chat_ad_id_reward
					ai_chat_to_recharge_flag = true
					if (ai_chat_to_recharge_flag) {
						uni.showModal({
							title: "温馨提醒", // 标题  
							content: this.$commonApi.configs.chargeTip || "体验额度已用完，可以联系客服购买充值绘画次数", // 内容  
							showCancel: true, // 可以不要  
							confirmText: "购买次数",
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
					return false
				}

				this.user = user
				this.chat.push({
					problem: that.problem,
					answer: '',
					type: that.chatTypeFlag,
					client_avatar: that.user.avatarUrl
				})
				
				let index = this.chat.length-1
				
				this.scrollMsg()
				this.is_submit_question = true
				let msg = this.getChatMsg(this.lastHistoryIndex)
				//提问内容超长的话
				let msgLength = this.getDataLength(msg)
				if (msgLength >= 4000) {
					msg = this.getChatMsg(this.lastHistoryIndex - 3)
					uni.showToast({
						title: '文字太多了 ' + (that.chatType == 0 ? '' : ',从当前提问重新开始上下文问答'),
						icon: 'none'
					})
					this.openData = []
					that.lastHistoryIndex = that.chat.length - 4
				}

				//新版
				if (this.chatType == 0) {
					//一问一答
					this.openData = []
				}

				//设置提问内容
				this.openData.push({
					"role": "user",
					"content": this.$commonApi.getPromptByTemplate(this.problem, this.promptTemplate, null)
				})

				let openAiData = this.openData
				for (var i = 0; i < openAiData.length; i++) {
					if (openAiData[i].role == 'system') {
						openAiData.splice(i, 1)
					}
				}
				if (this.systemRole) {
					//设置场景
					openAiData.unshift({
						"role": "system",
						"content": this.systemRole
					})
				}

				this.problem = ""

				//多轮问答模式
				let version = '2.0'
				if (version == '2.0') {
					let requestChatData = {
						type: 'chat',
						data: openAiData,
					}

					requestChatData.onMessage = (res) => {
						uni.hideLoading()

						this.$set(this.chat, index, {
							...this.chat[index],
							answer: res.text
						});
						//保存历史记录
						this.saveMsg(this.chat[index])
						this.scrollMsg()
					}

					//6.3，是否h5优先走fetch获取gpt数据
					let is_first_wss = true
					// #ifdef H5
					is_first_wss = this.$commonApi.configs.is_first_wss || true
					// #endif

					// #ifndef H5
					is_first_wss = true
					// #endif

					if (is_first_wss && this.$commonApi.chat_type() == 'socket' && this.websocket_status()) {
						//socket正常才走wss，否则调用接口返回
						this.allContent = ''
						this.$commonApi.openaiSocket(requestChatData, this.gpt_version).then((res) => {
								if (res.code != 0) {
									//移出失败的
									this.openData.splice(this.openData.length - 1, 1)
									this.$set(this.chat, index, {
										...this.chat[index],
										answer: res.msg || res.text
									});
									this.scrollMsg()

									uni.hideLoading()
									uni.showToast({
										title: res.msg || res.text,
										icon: 'none'
									})
									this.is_submit_question = false
									return false
								}
								this.apikey = res.apikey
								//5.20新增，openai chat的完整连接地址
								let openaiChatUrl = this.$commonApi.configs.openaiChatUrl || ''
								this.websocketSend({
									msg: res.text,
									openaikey: res.apikey,
									url: openaiChatUrl
								})
								that.scrollMsg()
								//新增20秒超时提醒
								this.timer_gpt_reply = setTimeout(() => {
									that.$set(that.chat, index, {
										...that.chat[index],
										answer: '查询内容超时,请重新提问试试!'
									});
									this.is_submit_question = false
									//记录错误原因5.27
									this.$commonApi.ai_chat_api_key_vaild({
										content: ({
											error: '提问超时,目前wss状态:' + this.$commonApi
												.getWebsocketStatus(this.websock)
										}),
										apikey: this.apikey
									}).then((res) => {})

									//保存历史记录
									//that.saveMsg(that.chat[index])
								}, 30000)
							})
							.then((res) => {})
							.catch((err) => {
								this.is_submit_question = false

								//记录错误原因5.27
								this.$commonApi.ai_chat_api_key_vaild({
									content: ({
										error: '提问异常(' + JSON.stringify(err) + '),目前wss状态:' + this
											.$commonApi.getWebsocketStatus(this.websock)
									}),
									apikey: this.apikey
								}).then((res) => {})

								uni.hideLoading()
								uni.showToast({
									title: '没有返回内容,请稍后再试!',
									icon: 'none'
								})
							})
						return false
					}


					// #ifdef H5 
					//这里只是H5支持，app不支持
					if (true) {
						this.$commonApi.openai_h5(requestChatData, this.gpt_version).then((res) => {
							uni.hideLoading()
							this.is_submit_question = false

							if (res.code == 0) {
								this.$set(this.chat, index, {
									...this.chat[index],
									answer: res.text
								});
								//保存历史记录
								this.saveMsg(this.chat[index])

								//机器人回复assistant
								this.openData.push({
									"role": "assistant",
									"content": res.text
								})

								//提问次数扣减
								let number = 1
								if (this.gpt_version.indexOf('4.0') > -1) {
									number = Math.abs(this.$commonApi.configs.gpt_cost_4 || 10)
								} else if (this.gpt_version.indexOf('3.0') > -1) {
									number = Math.abs(this.$commonApi.configs.gpt_cost_3 || 1)
								}
								this.$commonApi.ai_chat_reduce_use_times({
									number: number,
									data: {
										question: this.chat[index].problem,
										reply: res.text || res.msg
									}
								}).then((res) => {
									if (this.user.isvip != 1) {
										this.user.number -= number
									}
									this.user.openNumber += 1
									this.uni_setStorageSync('user', this.user)
								})

								this.scrollMsg()

							} else {
								//移出失败的

								this.openData.splice(this.openData.length - 1, 1)
								this.$set(this.chat, index, {
									...this.chat[index],
									answer: res.text
								});
								this.scrollMsg()
							}
						}).catch((err) => {
							console_log(err)
							this.is_submit_question = false
							this.$set(this.chat, index, {
								...this.chat[index],
								answer: '没有返回内容,请稍后再试!'
							});
						})
						return false
					}
					// #endif


					this.$commonApi.ai_chat_open_ai_api(requestChatData, this.gpt_version).then((res) => {
						this.is_submit_question = false
						if (res.code == 0) {
							this.$set(this.chat, index, {
								...this.chat[index],
								answer: res.text
							});
							//保存历史记录
							this.saveMsg(this.chat[index])

							//机器人回复assistant
							this.openData.push({
								"role": "assistant",
								"content": res.text
							})
							this.scrollMsg()

						} else {
							//移出失败的
							this.openData.splice(this.openData.length - 1, 1)
							this.$set(this.chat, index, {
								...this.chat[index],
								answer: 'error'
							});
							this.scrollMsg()
						}
					}).catch((err) => {
						this.is_submit_question = false
						this.$set(this.chat, index, {
							...this.chat[index],
							answer: '没有返回内容,请稍后再试!'
						});
					})
					return false
				}
				return
			},
			//问答end


			//4.11	
			showSelectTemplate() {
				this.isShowSelectTemplate = !this.isShowSelectTemplate
			},
			randTemplate() {
				let randCount = 8
				let tmp = this.$commonApi.randomSort(this.templateList)
				this.randTemplateList = tmp.slice(0, randCount)
			},
			getTemplateByGroupName(title, i) {
				this.groupTemplateNameSelect = i
			},
			addChat() {
				let idx = this.chatDialogs.length + 1
				this.chatDialogs.push({
					//index: idx,
					title: '新建绘画' + idx
				})
				this.uni_setStorageSync('drawDialogData', this.chatDialogs)
			},
			clearAllChat() {
				for (let item of this.chatDialogs) {
					let msg_title_id = this.$commonApi.MD5(item.title)
					uni.removeStorageSync('ai_chat_draw_his_last_id' + msg_title_id)
					uni.removeStorageSync('ai_chat_draw_his' + msg_title_id)
				}
				this.chatDialogs = []
				this.chat = []

				this.chat.push({
					problem: '',
					save: false,
					answer: this.answer
				})

				this.uni_setStorageSync('drawDialogData', this.chatDialogs)

				this.isShowSelectTemplate = false
				this.$refs.create_chat_Dialog.close()

			},
			selChatDialog(item, index) {
				this.chatDialogsIndex = index
				//加载数据
				this.initChatData(item)
				this.isShowSelectTemplate = false
				this.$refs.create_chat_Dialog.close()
			},
			delChatDialog(item, index) {
				let that = this
				uni.showModal({
					title: '温馨提醒',
					content: '是否清空当前记录,无法恢复',
					success: (res) => {
						if (res.confirm) {
							that.chatDialogs.splice(index, 1)
							let msg_title_id = that.$commonApi.MD5(item.title)
							uni.removeStorageSync('ai_chat_draw_his_last_id' + msg_title_id)
							uni.removeStorageSync('ai_chat_draw_his' + msg_title_id)
							this.uni_setStorageSync('chatDialogData', this.chatDialogs)
						}
					}
				})
			},
			editChatDialogOpen(item, index) {
				this.chatDialogsTitle = item.title
				this.chatDialogsIndex = index
				this.$refs.editChatDialog.open()
			},
			editChatDialogCancel() {
				this.$refs.create_chat_Dialog.close()
			},
			editChatDialogConfirm(text) {
				if (text == this.chatDialogsTitle) {
					this.$refs.create_chat_Dialog.close()
					return
				}
				//是否已存在
				let exists = this.chatDialogs.filter(f => f.title == text)
				if (text != this.chatDialogsTitle && exists && exists.length > 0) {
					uni.showToast({
						title: '该绘画记录标签已存在',
						icon: 'none'
					})
					return
				}
				let msg_title_id = this.$commonApi.MD5(this.chatDialogsTitle)
				let history = uni.getStorageSync('ai_chat_draw_his' + msg_title_id)
				//移除旧的
				uni.removeStorageSync('ai_chat_draw_his_last_id' + msg_title_id)
				uni.removeStorageSync('ai_chat_draw_his' + msg_title_id)

				let index = this.chatDialogsIndex
				this.$set(this.chatDialogs, index, {
					...this.chatDialogs[index],
					title: text
				});

				msg_title_id = this.$commonApi.MD5(text)
				uni.setStorageSync('ai_chat_draw_his' + msg_title_id, history)
				this.uni_setStorageSync('drawDialogData', this.chatDialogs)

				this.$refs.create_chat_Dialog.close()
			},
			initGptVersions() {
				if (this.configs.ai_chat_gpt_version) {
					let itemList = []
					for (let s of this.configs.ai_chat_gpt_version.split(',')) {
						if (s.indexOf('3.5') > -1) {
							itemList.push('AIChat 3.5')
						} else if (s.indexOf('4.0') > -1) {
							itemList.push('智能AI 4.0')
						}
					}
					return itemList
				}
				return ['AIChat 3.5']
			},
			changeChatVersion() {
				let that = this
				let itemList = this.initGptVersions()
				uni.showActionSheet({
					itemList: itemList,
					success: function(res) {
						switch (res.tapIndex) {
							case 0:
								that.gpt_version = 'AIChat 3.5'
								break
							case 1:
								that.gpt_version = '智能AI 4.0'
								break
						}
					},
				})
			},
			showToast(title) {
				uni.showModal({
					title: title,
					showCancel: false
				})
			},
			get_draw_version() {
				if (this.imageEngine.toLowerCase() == 'mj') {
					return 'MJ'
				}
				return ''
			},

		},
	}
</script>

<style lang="scss" scoped>
	@import "@/pages/ai/ai.scss";
</style>