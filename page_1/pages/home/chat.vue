<template>
	<view class="container" :data-theme="state.app.theme">
		<view class="bg" v-if="true"></view>
		<view class="form" v-if="true">
			<view class="header" >
				<view @click="changeChatVersion"
					style="border: 1px solid #686efe;  border-radius: 30px; padding: 6px 14px;">
					切换对话模型及版本 {{gpt_name}}
				</view>
				<view style="color: rgb(85, 170, 255);padding: 6px 14px;">
					剩余{{user.number<=0?0:user.number}}次</view>
			</view>
			<u-transition :show="true" mode="fade-left">
				<view class="panel">

					<view v-if="isInnerPage" style="width: 40px;margin: 10px auto;">
						<image style="max-height: 40px;" mode="heightFix" :src="menu_select.url"></image>
					</view>

					<view v-if="isInnerPage" style="width:90%;margin:0  auto 30px auto;text-align: center">
						<view>{{menu_select.description}}</view>
					</view>



					<view class="askBox">
						<view class="head">
							<view class="title"><text
									style="color: red;">*</text>填写创作内容(<text>{{inputCount}}/{{ai_chat_msg_max_length}}</text>)
							</view>
							<view class="tips" @click="getHistoryData">提问记录</view>
						</view>
						<view class="textarea">
							<textarea
								style="width: 98%;min-height:128px;border-radius: 7px;border: 1px solid #ddd;padding:8px;"
								:maxlength="ai_chat_msg_max_length" height="120" v-model="msg"
								:placeholder="placeholder"></textarea>
						</view>
					</view>

					<view class="askBox" v-for="(item,i) in controllers">
						<view class="head">
							<view class="title"><text
									style="color: red;">{{item.require?'*':''}}</text>{{item.title}}(<text>{{item.val.length}}/{{item.maxlength}}</text>)
							</view>
							<view class="tips" style="color: cornflowerblue;"
								v-if="item.controll_type=='select' && item.data_source">
								<picker class="picker" @change="selectControllValue($event,item,i)"
									:range="getRange(item)">
									<view class="picker">
										请选择{{item.title}}
									</view>
								</picker>
							</view>
						</view>

						<view class="textarea" v-if="item.controll_type=='radio' && item.data_source">
							<radio-group @change="selectControllValue($event,item,i)">
								<view v-for="(radio,j) in getRange(item,true)"
									style="margin-bottom: 5px; display: inline-block; margin-right: 10px;">
									<radio :value="radio" />{{radio}}
								</view>
							</radio-group>
						</view>

						<view class="textarea">
							<u--input v-if="item.controll_type !='input_number'" :key="item.key" v-model="item.val"
								:maxlength="item.maxlength" :placeholder="item.placeholder"></u--input>

							<u--input v-if="item.controll_type=='input_number'" type="number" :key="item.key"
								v-model="item.val" :maxlength="item.maxlength"
								:placeholder="item.placeholder"></u--input>

						</view>
					</view>

					<view class="btn-group">
						<view class="btn get">
							<u-button @click="onSubmitGPT" iconColor="#fff" class="primary-color" color="#aaaaff"
								icon="edit-pen" :text="is_submit_question?'正在创作':'开始创作'"></u-button>
						</view>
						<view class="btn paste">
							<u-button style="color:#ffffff;background-color: #aaaa7f;" v-if="templateList.length>0"
								@click="selectModule" text="示例"></u-button>
						</view>
					</view>

					<view style="text-align: center;width: 100%;margin-top: 20px;color: #55aaff;" @click="kefuDialogShow">
						<text>遇到问题？联系客服</text>
					</view>



				</view>
			</u-transition>
		</view>


		<view class="tool">
			<view class="textarea" style="margin-bottom: 50px;" id="askResultClassId" v-if="askResult.length>0">
				<view style="margin-top:auto;text-align: right;" v-if="false">
					<image v-if="!isStopChat" @click="stopChat" src="/static/common/stop.png" mode="widthFix"
						style="width: 25px;"></image>
				</view>
				<scroll-view style=" background-color: #fff;padding:10px 0" v-for="(item,index) in askResult"
					:key="index" ref="resultScroll" class="askResultClass">
					<text v-if="index==0">{{item.text}}</text>
				</scroll-view>


				<view class="btn" @click="copy(askResult[0].text)">
					<u-button color="#686efe" icon-color="#ffffff" icon="file-text" text="复制内容">
					</u-button>
				</view>

				<view class="btn" style="margin-top: 10px;" v-if="!isStopChat" @click="stopChat">
					<u-button color="#f0ad4e" icon-color="#ffffff" icon="file-text" text="停止生成">
					</u-button>
				</view>

				<view class="btn" style="margin-top: 10px;" @click="onSubmitGPT(true)"
					v-if="isStopChat && isReAsk&&askResult[0].text">
					<u-button color="#dd524d" icon-color="#ffffff" icon="file-text" text="重新生成">
					</u-button>
				</view>




			</view>

			<view class="header" v-if="false">
				<view class="title">选择创作模块，左滑查看更多哟</view>
			</view>

			<u-transition :show="true" mode="slide-up">
				<scroll-view class="scroll-view_H" scroll-with-animation scroll-x="true" scroll-left="0"
					v-if="moduleList.length>0">

					<view class="scroll-view-item_H" v-for="arr in get_moduleList_array(6)">
						<view class="grid">
							<view v-if="!item.onlyH5" :class="isActive==item.index?'activeItem item ':'item '"
								v-for="(item,index) in arr" :key="index" @click="selectRole(item,item.index)"
								:style="{backgroundColor:isActive == item.index ?'$btn-color-primary' : ''}">
								<view class="icon">
									<u-icon size="28" :name="item.url">
									</u-icon>
								</view>
								<view class="title">{{item.title}}</view>
								<view class="desc">{{item.description}}</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</u-transition>

		</view>

		<!-- #ifdef MP-WEIXIN -->
		<view v-if="isShowAds">
			<ad v-if="ai_chat_ad_id_bottom" :unit-id="ai_chat_ad_id_bottom"></ad>
		</view>
		<!-- #endif -->

		<uni-drawer ref="selectModuleDialog" mode="right" :width="300" :mask-click="true" v-if="templateList.length>0">
			<view class="pose-list" style="height: 461px;width: 100%;margin-top: 50px;">
				<view class="uni-scroll-view">
					<view class="uni-scroll-view" style="overflow: hidden auto;">
						<view class="uni-scroll-view-content">
							<view class="pose-list-item ellipsis" @tap="changeModule(item)"
								v-for="(item,i) in templateList">
								{{replaceChatGptStr(item.title)}}
							</view>
						</view>
					</view>
				</view>
			</view>
		</uni-drawer>


		<!-- #ifdef MP-WEIXIN -->
		<view class="share" v-if="false" style="bottom: 93px;">
			<u-button shape="circle" class="primary-color" color="#686efe" style="margin-bottom:10rpx;" :plain="true"
				icon="share" open-type="share" text="推荐给朋友+3">
			</u-button>
		</view>
		<view class="share" v-if="ai_chat_ad_id_reward">
			<u-button shape="circle" @click="adClick()" style="margin-top:10rpx;" class="primary-color" color="#686efe"
				text="看视频攒次数">
			</u-button>
		</view>
		<!-- #endif -->


		<uni-popup ref="kefuDialog" type="dialog">
			<view style="width:100%;margin: 0 auto;text-align: center">
				<image :show-menu-by-longpress="true" @click="previewImage" style="max-width:300px;"
					:src="ai_chat_wx_qr_code" mode="heightFix"></image>
			</view>
		</uni-popup>


	</view>
</template>

<script>
	let videoAd = null;
	export default {
		options: {
			styleIsolation: "shared",
		},
		data() {
			return {
				isInnerPage: true, //是否内页
				isShowAds: true, //是否显示广告
				autoHeight: false,

				user: {},
				msg: "",
				apikey: '',
				moduleList: [],
				templateList: [],
				broadcastData: [],
				broadcastStyle: {
					speed: 1, //每秒1个字
					font_bold: "normal",
					font_size: "32", //字体大小(rpx)
					text_color: "#f56c6c", //字体颜色
					back_color: "#FEF0F0", //背景色				
				},
				openai_end: false,
				is_submit_question: false,


				openData: {},
				isActive: 0,
				againText: '',

				systemRole: '',

				//提问记录
				ask_history: [],
				placeholder: '你可以这样问：帮我写一个200字的产品推广计划。长按粘贴您的问题哦',
				askResult: [],
				scrollTopHeight: 999,


				websock: null,
				websock_timer: null,
				websock_retry_times: 0,
				lockReconnect: false,
				allContent: '',
				allContentError: '',
				showModule: false,
				menu_select: {},
				promptTemplate: '', //prompt模板

				inputCount: 0, //已输入数字总数
				ai_chat_msg_max_length: 3000, //最大输入字数限制
				ai_chat_wx_qr_code: '',
				ai_chat_ad_id_bottom: '',
				is_bg_task: true, //是否退出后，后台运行

				ai_chat_key_word_list: [],

				isStopChat: true, //暂停打印功能
				isStopChatIndex: -1, //暂停打印功能

				timer_gpt_reply: null, //gpt超时定时器
				state: {},

				controllers: [],
				ai_chat_ad_id_reward: '',
				isReAsk: false, //是否可以重新提问（需要等连接建立完成）
				notAutoConnect: false,

				gpt_name: 'AIChat 3.5', //模型名称
				gpt_version: 'gpt-3.5-turbo', //选中的模型的值
				ai_chat_api_key_sec:{},
				ai_chat_version_list: [], //6.19 新增
				cur_cost: 1,
			};
		},
		watch: {
			msg(val) {
				this.inputCount = this.getDataLength(val)
			},
		},
		onShow() {
			this.state = this.$store.state
			this.isStopChat = true
			let menu_select = this.uni_getStorageSync('menu_select')
			this.menu_select = menu_select

			this.promptTemplate = this.menu_select.promptTemplate || ''

			this.userInfo()
			this.getTemplateList()
			this.ask_history = this.uni_getStorageSync('ask_history') || []

			this.ai_chat_key_word_list = this.uni_getStorageSync('ai_chat_key_word') || []
		},
		onShareAppMessage: function() {
			this.console_log('onShareAppMessage 2')
			let user = this.uni_getStorageSync('user');
			let that = this

			this.$commonApi.addNumber({
				openid: user.openid,
				number: this.$commonApi.configs.shareAppNumber || 1
			}).then((resuls) => {
				this.console_log(resuls);
			})

			return {
				title: this.$commonApi.getShareTitle(),
				path: this.$commonApi.homePage() + '?type=haoyou&inviteCode=' + user.my_invite_code
			};
		},
		onShareTimeline: function() {
			this.console_log('onShareTimeline 2')
			let user = this.uni_getStorageSync('user');
			let that = this

			this.$commonApi.addNumber({
				openid: user.openid,
				number: this.$commonApi.configs.shareAppNumber || 1
			}).then((resuls) => {
				this.console_log(resuls);
			})


			return {
				title: this.$commonApi.getShareTitle() + ' 你也来试试吧',
				path: this.$commonApi.homePage() + '?type=pengyouquan&inviteCode=' + user.my_invite_code
			};
		},
		onBackPress() {
			if (!this.is_submit_question) {
				this.notAutoConnect = true
				this.closeWebsocket(true)
			}
		},
		onUnload() {
			if (!this.is_submit_question) {
				this.notAutoConnect = true
				this.closeWebsocket(true)
			}
		},
		onLoad(option) {
			this.$commonApi.save_share_invite_code(option.inviteCode || '')
			this.ai_chat_ad_id_bottom = this.$commonApi.ai_chat_ad_id_bottom
			if (option && option.title) {
				uni.setNavigationBarTitle({
					title: option.title || ''
				})
			}
			this.get_ai_chat_config()
			if ((!option.title || option.title == 'undefined') && this.isInnerPage) {
				//this.ai_chat_wx_qr_code=''
				//this.kefuDialogShow()
			}
			this.ai_chat_msg_max_length = this.$commonApi.ai_chat_msg_max_length
			let menu_select = this.uni_getStorageSync('menu_select')
			this.menu_select = menu_select
			this.promptTemplate = this.menu_select.promptTemplate || ''
			this.systemRole = this.menu_select.systemRole || ''
			this.placeholder = !menu_select ? '请输入创作内容' : (menu_select.placeholder || '请输入创作内容')
			this.msg = menu_select.message

			//6.3，是否h5优先走fetch获取gpt数据
			let is_h5_first_wss = true
			// #ifdef H5
			is_h5_first_wss = this.$commonApi.configs.is_h5_first_wss || true
			// #endif

			// #ifndef H5
			is_h5_first_wss = true
			// #endif

			if (is_h5_first_wss && this.$commonApi.chat_type() == 'socket' && this.user) {
				setTimeout(() => {
					//
					this.initWebSocket()
				}, 1500)

				//监听
				this.websock_timer = setInterval(() => {
					if (this.websock != null) {
						//this.console_log('readyState:'+this.websock.readyState);
					}
				}, this.websock_retry_times % 5 == 1 ? 6000 : 8000)

				setInterval(() => {
					if (this.websock != null) {
						this.websock.send({
							data: 'ping'
						})
					}
				}, 10000)

			}

			let that = this;
			setTimeout(() => {
				that.broadcastData = [
					"提醒：禁止发送色情、政治、辱骂等不当言论,与平台无关",
					"当前使用人数过多,获取答案可能超过30秒钟,耐心等待哦",
					"请勿输入违规词,文明提问,遵守法律法规",
				]
			}, 0)

			//检测用户是否登录
			let user = this.uni_getStorageSync('user');
			this.user = user;

			//加載廣告
			this.adLoad()

			this.initGptVersions()
			
			// #ifdef H5
			//当前页面才生效
			let _cur_page = 'home/chat'
			if (this.$commonApi.isInCurrentPage(_cur_page)) {
				document.onkeydown = event => {
					var e = event || window.event;
					if (e && e.shiftKey && e.keyCode == 13) { //回车键的键值为13
						this.onSubmitGPT()
					}
				};
			}
			// #endif

		},
		components: {
		},
		methods: {
			getRange(item, noDef) {
				let items = ((!noDef ? '请选择,' : '') + item.data_source).split(',')
				return items
			},
			selectControllValue(e, item, i) {
				if (!e.target.value) {
					return
				}
				let index = Number(e.target.value)
				let items = ('请选择,' + item.data_source).split(',')
				let value = items[index]
				if (value == '请选择') {
					value = ''
				}
				let key = item.key
				this.$set(this.controllers, i, {
					...this.controllers[i],
					val: value,
				})

			},
			copy(content) {
				uni.setClipboardData({
					data: content,
					success: function() {
						uni.showToast({
							title: '复制成功',
							icon: 'none'
						})
					}
				});
			},

			replaceChatGptStr(str) {
				return (str || '').replace(/(chatgpt|gpt|openai)/gi, '')
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
			onChatMessage(res) {
				let aid = 0
				this.$set(this.askResult, aid, {
					...this.askResult[aid],
					text: res.text,
				});
				this.isStopChat = false
				this.isStopChatIndex = 0
				this.$nextTick(() => {
					this.scrollTopHeight += 100
				}, 10);
			},
			//关闭
			closeWebsocket(isClose) {
				if (isClose && this.websock && this.websock.readyState == 1) {
					if (this.$commonApi.chat_type() == 'socket') {
						if (this.websock != null) {
							this.websock.close()
						}
						//离开页面后，不再自动连接wss
						this.lockReconnect = true
						this.console_log('退出页面关闭连接')
					}
					clearInterval(this.websock_timer)
				}
			},
			stopChat() {
				this.isStopChat = true
				this.isStopChatIndex = -1
				this.isReAsk = false
				this.finishChat({
					code: 0,
					text: this.allContent.replace(/^\n|\n$/g, "")
				})
				//关闭
				if (this.websock != null) {
					this.websock.close()
				}
				this.reconnect()
			},
			//问答完成
			async finishChat(res) {
				let that = this
				this.isStopChat = true
				if (res.code == 419 && res.json) {
					//更新key状态
					this.$commonApi.ai_chat_api_key_vaild({
						content: JSON.parse(res.json),
						apikey: this.apikey
					}).then((res) => {})
				}
				//处理违规返回内容
				if (this.$commonApi.ai_chat_is_check_res && !res.text.startsWith('http')) {
					await this.$commonApi.msgSecCheck(res.text).then((secRes) => {
						if (secRes.code != 200) {
							res.text = '返回内容不合规,' + secRes.msg
						}
					}).catch((res) => {
						res.text = '返回内容不合规'
					})
				}
				//检测图片
				if (this.$commonApi.is_check_image_result && res.text.startsWith('http')) {
					await this.$commonApi.mediaSecCheck(res.text).then((secRes) => {
						if (secRes.code != 200) {
							res.text = '生成的图片不合规,' + secRes.msg
						}
					}).catch((res) => {
						res.text = '生成的图片不合规'
					})
				}

				if (res.code == -1) {
					uni.hideLoading()
					this.msg = res.text
					return false
				}

				if (res.code == 0) {
					//提问次数扣减
					let number = this.cur_cost
					this.$commonApi.ai_chat_reduce_use_times({
						number: number,
						data: {
							question: this.msg,
							reply: res.text || res.msg,
							type: 'ask',
							apikey: this.apikey
						}
					}).then((res) => {
						if (this.user.isvip != 1) {
							this.user.number -= number
						}
						this.user.openNumber += 1
						this.uni_setStorageSync('user', this.user)
					})
				}

				uni.hideLoading()
				let h_id = that.ask_history.length - 1

				this.$set(this.ask_history, h_id, {
					...this.ask_history[h_id],
					answer: res.text,
				});
				let question = this.msg
				this.uni_setStorageSync('ask_history', this.ask_history)
				this.is_submit_question = false

				//this.msg =''

				let aid = 0
				// this.$set(this.askResult, aid, {
				// 	...this.askResult[aid],
				// 	text: '',
				// })

				if (res.code == 0) {
					//如果是停留在当前页面就不弹窗
					//this.closeWebsocket(true)
					if (this.$commonApi.isInCurrentPage('/home/chat')) {
						that.toAskResultPage(question, res.text)
						return
					}
					uni.showModal({
						title: "温馨提醒", // 标题  
						content: "客官，你的提问内容已制作好了，是否查看?", // 内容  
						showCancel: true, // 可以不要  
						confirmText: "立即查看",
						success: (mod) => {
							if (mod.confirm) {
								that.toAskResultPage(question, res.text)
							}
						}
					})
				} else {
					uni.showToast({
						title: res.msg || '',
						icon: 'none'
					})
				}
			},
			initWebSocket() {
				if (this.websock && this.websock.readyState == 1) {
					return
				}
				let wssUrl = this.$commonApi.get_ai_chat_wss_url()
				if (!wssUrl) {
					this.websock = null
					return
				}
				this.websock = uni.connectSocket({
					url: wssUrl,
					complete: () => {
						this.console_log('socket complete');
					} // 由于uni封装，必须加个回调才会返回一个SocketTask对象
				});
				this.websock.onOpen(this.websocketonopen)
				this.websock.onMessage(this.websocketonmessage)
				this.websock.onClose(this.websocketclose)
				this.websock.onError(this.websocketonerror)
			},
			websocketonopen() { // 连接建立之后执行send方法发送数据，连接成功
				//this.websocketSend({'token':''+this.$commonApi.get_user_token()})
				this.console_log('打开连接，状态：' + this.websock.readyState);
				if (this.websock.readyState == 1) {
					this.isReAsk = true
				}
			},
			websocket_status() {
				return this.websock != null && this.websock.readyState == 1
			},
			websocketSend(result) {
				//判断服务器是否在线
				if (this.websock == null || this.websock.readyState != 1) {
					this.is_submit_question = false
					uni.showToast({
						title: '应用繁忙，请重新进入小程序试试',
						icon: 'none'
					})
					return false
				}
				//绑定账号
				result.ai_chat_wx_mp_appid = this.$commonApi.ai_chat_wx_mp_appid

				let encry_data = this.aes_encrypt(JSON.stringify(result))
				this.websock.send({
					//加密
					data: encry_data
				})
			},
			websocketonmessage(e) { // 数据接收
				this.lockReconnect = true;
				let json = e.data
				this.websock_retry_times = 0
				if (!json || json == 'pong') {
					return
				}
				//关闭超时提醒
				if (this.timer_gpt_reply) {
					clearTimeout(this.timer_gpt_reply)
				}
				//this.console_log(json)
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
							text: '服务异常，请联系客服'
						})
					}
					return true
				}
				
				if (json.indexOf('error_code') > -1 && ( json.indexOf('336003') > -1 || json.indexOf('Open api daily request limit reached') > -1)) {
					
					uni.showModal({
						title: "温馨提醒", // 标题
						content: "平台文心一言服务欠费，通知平台充值！",
						showCancel:false
					})
					return
				}
				
				if(json=='data: [DONE]'){
					return;
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
					if (line.indexOf('[DONE]') > -1 || line.indexOf('ERROR]') > -1) {
						this.finishChat({
							code: 0,
							text: this.allContent.replace(/^\n|\n$/g, "")
						})
						return true
					}
					let value = str
					if (value && value.indexOf('[DONE]') == -1 && value.length > 0) {
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
							//this.console_log('home:error:'+this.allContentError)
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
							//this.console_log('home::error:'+this.allContentError)
						}

					}
				})

				if (this.$commonApi.isInCurrentPage('/home/chat')) {
					uni.pageScrollTo({
						scrollTop: 9999999, // 设置一个超大值，以保证滚动条滚动到底部
						duration: 0
					})
				}

			},

			pageScrollToBottom() {
				wx.createSelectorQuery().select("#askResultClassId").boundingClientRect(function(rect) {
					wx.pageScrollTo({
						scrollTop: rect.height
					});
				}).exec();
			},

			websocketclose(e) { // 关闭
				this.console_log('关闭了连接 websocketclose :' + this.websock.readyState);
				this.lockReconnect = false;
				this.is_submit_question = false

				// CONNECTING：值为0，表示正在连接。
				// OPEN：值为1，表示连接成功，可以通信了。
				// CLOSING：值为2，表示连接正在关闭。
				// CLOSED：值为3，表示连接已经关闭，或者打开连接失败。

				this.reconnect()
			},
			websocketonerror() {
				this.websock_retry_times += 1
				this.console_log('断开了重连');
				this.lockReconnect = false;
				this.is_submit_question = false
				this.reconnect()
			},
			reconnect() {
				if (this.notAutoConnect) {
					//this.console_log('离开页面，不自动连接')
					return
				}
				if (this.lockReconnect) {
					this.console_log('已经连接')
					return
				}
				this.lockReconnect = true;
				//没连接上会一直重连，设置延迟避免请求过多
				let that = this
				this.allContent = ''
				this.is_submit_question = false
				this.console_log('ask重连中:' + new Date());
				that.initWebSocket();
				that.lockReconnect = false;
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
					////this.console_log(res);;
				})
			},
			getHistoryData() {
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
			kefuDialogShow() {
				this.previewImage()
				return
				this.$refs.kefuDialog.open()
			},

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
						this.console_log('previewImage res', res);
					},
					fail: err => {
						this.console_log('previewImage err', err);
					}
				});
			},
			get_ai_chat_config() {
				let ai_chat_config_conn = this.uni_getStorageSync('ai_chat_config')
				for (let s of ai_chat_config_conn) {
					if (s.key == 'is_showChat' && !(!s.val)) {
						this.showChat = true
						break
					}
				}

				for (let s of ai_chat_config_conn) {
					if (s.key == 'ai_chat_wx_qr_code') {
						this.ai_chat_wx_qr_code = s.val
						break
					}
				}
			},
			async getTemplateList() {
				let isLogin = this.$commonApi.get_user_token()
				if (!isLogin) {
					return false
				}
				let data = await this.$commonApi.callFunctionAsync('ai-chat-template')
				//追加
				let tmpItems = []
				for (var i = 1; i <= 30; i++) {
					if (!this.menu_select['demo' + i]) {
						continue
					}
					tmpItems.push({
						message: this.menu_select['demo' + i],
						systemRole: this.menu_select.systemRole,
						promptTemplate: this.menu_select.promptTemplate || '',
						placeholder: this.menu_select.placeholder,
						title: this.menu_select['demo' + i],
					})
				}
				tmpItems.push({
					message: '',
					systemRole: this.menu_select.systemRole,
					placeholder: this.menu_select.placeholder,
					promptTemplate: this.menu_select.promptTemplate || '',
					title: '',
				})
				this.templateList = tmpItems 
				//this.templateList = tmpItems.concat(data.result)
				return

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

			changeModule(item) {
				//title：显示按钮
				//systemRole:固定场景
				//message:用户文案
				//isAuto:自动填充用户文案

				this.$refs.selectModuleDialog.close()

				this.systemRole = item.systemRole
				this.placeholder = item.placeholder || '请输入创作内容'
				this.promptTemplate = item.promptTemplate || ''
				if (!item.isAuto) {
					this.msg = item.message;
					uni.showToast({
						title: '请手动修改文案内容哦',
						icon: 'none'
					})
				} else {
					this.onSubmitGPT()
				}

			},

			selectRole(item, index) {
				this.isActive = index
				this.systemRole = item.systemRole
				this.placeholder = item.placeholder || '请输入创作内容'
				this.promptTemplate = item.promptTemplate || ''
				if (item.message) {
					this.msg = item.message;
				} else {
					//this.msg ='';
				}
			},

			async adClick() {
				var that = this
				if (videoAd) {
					videoAd.show().catch(err => {
						// 失败重试
						// this.console_log("广告拉去失败")
						videoAd.load().then(() => videoAd.show())
					})
				}
			},
			async adLoad() {
				var that = this
				this.ai_chat_ad_id_reward = this.$commonApi.configs.ai_chat_ad_id_reward
				// #ifdef MP-WEIXIN
				if (wx.createRewardedVideoAd && this.$commonApi.ai_chat_ad_id_reward) {
					//播放视频，激励回答次数
					videoAd = wx.createRewardedVideoAd({
						adUnitId: this.$commonApi.ai_chat_ad_id_reward
					});
					//捕捉错误
					videoAd.onError(err => {
						// 进行适当的提示
						this.console_log('videoAd onError', res);
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
					this.console_log(resuls);
				})
				user.number = user.number + addTimes;

				//视频积分
				that.$commonApi.ai_chat_user_credits({
					openid: user.openid,
					number: addTimes
				}).then((resuls) => {
					this.console_log(resuls);
				})
				user.broadNumber = user.broadNumber + addTimes;


				this.uni_setStorageSync('user', user);
				this.user = user
			},
			getClipboardData() {
				var that = this;
				uni.getClipboardData({
					success: function(res) {
						that.msg = res.data
					}
				})
			},
			tryAgain() {
				this.againText = ',不满意AI结果，重新生成'
				this.onSubmitGPT(true)
			},

			//打字机输出
			showContentSlow(content) {
				let placeholderTmp = content
				let i = 0
				let that = this
				let result = ''
				let placeholderTimer = setInterval(function() {
					if (i > placeholderTmp.length - 1) {
						clearInterval(placeholderTimer)
						return
					}
					result += placeholderTmp[i]
					let aid = 0
					that.$set(that.askResult, aid, {
						...that.askResult[aid],
						text: result,
					})
					i++
				}, 50)
				setTimeout(function() {
					clearInterval(placeholderTimer)
				}, 3000)
			},
			toAskResultPage(question, content) {
				//如果非home.vue页面，需要跳转回来
				if (!this.$commonApi.isInCurrentPage('home/chat')) {
					uni.navigateTo({
						url: '/page_1/pages/home/qa'
					})
				}
				return
				this.uni_setStorageSync('answer_result', encodeURIComponent(content))
				if (content.length > 1024) {
					content = content.substr(0, 1024)
				}
				uni.navigateTo({
					url: '/page_1/pages/home/answer?title=' + question + '&content=' + encodeURIComponent(
						content)
				})
				this.askResult = []
			},
			//获取口令内容
			getPromptByTemplate(content) {
				return this.$commonApi.getPromptByTemplate(content, this.promptTemplate, this.controllers)
			},
			async onSubmitGPT(reCreate) {
				if (!this.$commonApi.get_user_token()) {
					//登录系统
					this.$commonApi.is_login()
					return false
				}

				if (reCreate) {
					this.isStopChat = false
					this.is_submit_question = false
				}

				let _content =this.msg
				if (!_content || !this.msg.trim()) {
					uni.showToast({
						title: '你还没有输入内容呢！',
						icon: 'none'
					});
					return
				}

				try {
					_content = this.getPromptByTemplate(this.msg)
				} catch (e) {
					uni.showToast({
						title: e.message,
						icon: 'none'
					});
					return
				}

				reCreate = reCreate || false
				if (!reCreate) {
					this.againText = ''
				}
				//校验gpt关键词
				let errorPrompt = this.$commonApi.getGptDefaultPrompt(_content)

				if (errorPrompt) {
					this.showContentSlow(errorPrompt)
					return
				}

				if (this.is_submit_question) {
					uni.showToast({
						title: '请稍等，AI还在思考...',
						icon: 'none'
					});
					setTimeout(() => {
						this.is_submit_question = false
						this.isStopChat = false
					}, 10000)
					return false
				}

				var that = this
				//是否开启提问免费 5.2
				let is_limit_chat = await this.$commonApi.is_limit_chat()
				if (is_limit_chat) {
					let ai_chat_to_recharge_flag = this.$commonApi.ai_chat_recharge_type == 'charge'
					// #ifndef MP-WEIXIN
					ai_chat_to_recharge_flag = true
					// #endif

					if (ai_chat_to_recharge_flag) {
						uni.showModal({
							title: "温馨提醒", // 标题  
							content: this.$commonApi.configs.chargeTip || "体验额度已用完，可以联系客服购买充值次数", // 内容  
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

					// #ifdef MP-WEIXIN
					{
						uni.showModal({
							title: "温馨提醒", // 标题  
							content: this.$commonApi.configs.chargeTipWeixin || "体验额度已用完，观看视频奖励提问次数", // 内容  
							showCancel: true, // 可以不要  
							confirmText: "观看视频",
							success: (res) => {
								if (res.confirm) {
									that.adClick()
								} else {
									reject()
								}
							}
						})
						return false
					}
					// #endif
					return false
				}

				this.isShowAds = false

				this.is_submit_question = true
				this.isStopChat = false
				this.isStopChatIndex = -1

				let timeoutEnd = false
				let tips = ['客官，喝杯咖啡休息下吧，制作好我会通知你哦', '客官，给我一首歌的时间，你忙你的去吧，制作好我会通知你哦']
				let timeoutTimer = null;

				let version = '2.0'
				if (version == '2.0') {
					this.openData = {
						type: 'chat',
						data: [{
							"role": "user",
							"content": _content + this.againText,
						}],
					}

					//如果是模板则
					if (this.moduleList.length > 0 || this.menu_select) {
						this.openData = null
						let msgArr = []

						if (this.systemRole) {
							msgArr.push({
								"role": "system",
								"content": this.systemRole,
							})
						}
						msgArr.push({
							"role": "user",
							"content": (_content),
						})
						this.openData = {
							type: 'chat',
							data: msgArr,
						}
					}

					let h_id = that.ask_history.length
					that.ask_history.push({
						id: h_id,
						problem: that.msg,
						answer: '',
						time: new Date().getTime()
					})
					this.uni_setStorageSync('ask_history', that.ask_history)
					uni.showLoading()

					let aid = 0
					this.$set(this.askResult, aid, {
						...this.askResult[aid],
						text: 'AI正在思考...',
					})
					let question = _content

					this.openData.onMessage = (res) => {
						uni.hideLoading()
						if (this.isStopChat) {
							this.isReAsk = true
							return false
						}

						this.isStopChatIndex = aid
						this.isStopChat = false

						this.$set(this.askResult, aid, {
							...this.askResult[aid],
							text: res.text,
						});
						this.$nextTick(() => {
							if (this.$commonApi.isInCurrentPage('/home/chat')) {
								uni.pageScrollTo({
									scrollTop: 9999999, // 设置一个超大值，以保证滚动条滚动到底部
									duration: 0
								})
							}
						}, 100);
						uni.hideLoading()
						clearTimeout(timeoutTimer)
						return true
					}

					//6.3，是否h5优先走fetch获取gpt数据
					let is_h5_first_wss = true
					// #ifdef H5
					is_h5_first_wss = this.$commonApi.configs.is_h5_first_wss || true
					// #endif

					// #ifndef H5
					is_h5_first_wss = true
					// #endif
					if (is_h5_first_wss && this.$commonApi.chat_type() == 'socket' && this.websocket_status()) {
						//socket正常才走wss，否则调用接口返回
						this.allContent = ''
						this.$commonApi.openaiSocket(this.openData, this.gpt_version).then((res) => {
								this.apikey = res.apikey
								if (res.code != 0) {
									uni.hideLoading()
									uni.showToast({
										title: res.msg || res.text,
										icon: 'none'
									})
									// let aid = 0
									// this.$set(this.askResult, aid, {
									// 	...this.askResult[aid],
									// 	text: '',
									// })
									this.is_submit_question = false
									return false
								}
								
								let openaiChatUrl = ''
								
								if(this.ai_chat_api_key_sec.chatUrl){
									openaiChatUrl = this.ai_chat_api_key_sec.chatUrl || ''
								}
								
								this.websocketSend({
									msg: res.text,
									openaikey: res.apikey,
									url: openaiChatUrl
								})

								this.timer_gpt_reply = setTimeout(() => {
									this.is_submit_question = false
									//新增20秒超时提醒
									let aid = 0
									this.$set(this.askResult, aid, {
										...this.askResult[aid],
										text: '查询内容超时，请重试',
									})

									//记录错误原因5.27
									this.$commonApi.ai_chat_api_key_vaild({
										content: ({
											error: '提问超时,目前wss状态:' + this.$commonApi
												.getWebsocketStatus(this.websock)
										}),
										apikey: this.apikey
									}).then((res) => {})


								}, 15000)
							})
							.then((res) => {})
							.catch((err) => {
								uni.hideLoading()
								uni.showToast({
									title: '没有返回内容,请稍后再试!',
									icon: 'none'
								})
								let aid = 0
								// this.$set(this.askResult, aid, {
								// 	...this.askResult[aid],
								// 	text: '',
								// })
								this.is_submit_question = false
							})
						return false
					}

					// #ifdef H5
					this.$commonApi.openai_h5(this.openData).then((res) => {
						this.isStopChat = true
						if (res.code == -1) {
							uni.hideLoading()
							this.msg = res.text
							return false
						}
						if (res.code > 0) {
							uni.hideLoading()
							uni.showToast({
								title: res.text || '',
								icon: 'none'
							})
							return false
						}

						clearTimeout(timeoutTimer)
						uni.hideLoading()
						this.$set(this.ask_history, h_id, {
							...this.ask_history[h_id],
							answer: res.text || res.msg,
						});

						this.uni_setStorageSync('ask_history', this.ask_history)
						this.is_submit_question = false
						////this.msg =''

						let aid = 0
						// this.$set(this.askResult, aid, {
						// 	...this.askResult[aid],
						// 	text: '',
						// })

						//提问次数扣减
						let number = this.cur_cost
						this.$commonApi.ai_chat_reduce_use_times({
							number: number,
							data: {
								question: _content,
								reply: res.text || res.msg,
								type: 'ask',
								apikey: this.apikey
							}
						}).then((res) => {
							if (this.user.isvip != 1) {
								this.user.number -= 1
							}
							this.user.openNumber += 1
							this.uni_setStorageSync('user', this.user)
						})


						if (res.code == 0) {
							if (timeoutEnd) {
								uni.showModal({
									title: "温馨提醒", // 标题  
									content: "客官，你的提问内容已制作好了，是否查看？", // 内容  
									showCancel: true, // 可以不要  
									confirmText: "立即查看",
									success: (mod) => {
										if (mod.confirm) {
											that.toAskResultPage(question, res.text)
										}
									}
								})
							} else {
								this.toAskResultPage(question, res.text)
							}
						} else {
							uni.showToast({
								title: res.msg || '',
								icon: 'none'
							})
						}
					}).catch((err) => {
						uni.hideLoading()
						uni.showToast({
							title: '没有返回内容,请稍后再试!',
							icon: 'none'
						})
						this.is_submit_question = false
						this.isStopChat = true
					})
					return false

					// #endif



					this.$commonApi.ai_chat_open_ai_api(this.openData, this.gpt_version).then((res) => {
						clearTimeout(timeoutTimer)
						////this.console_log(res);;

						uni.hideLoading()

						this.$set(this.ask_history, h_id, {
							...this.ask_history[h_id],
							answer: res.text || res.msg,
						});

						this.uni_setStorageSync('ask_history', this.ask_history)
						this.is_submit_question = false
						if (res.code == 0) {
							if (timeoutEnd) {
								uni.showModal({
									title: "温馨提醒", // 标题  
									content: "客官，你的提问内容已制作好了，是否查看？", // 内容  
									showCancel: true, // 可以不要  
									confirmText: "立即查看",
									success: (mod) => {
										if (mod.confirm) {
											that.toAskResultPage(_content, res.text)
											//this.msg =''
										} else {
											//this.msg =''
										}
									}
								})
							} else {
								that.toAskResultPage(_content, res.text)
								//this.msg =''
							}
						} else {
							uni.showToast({
								title: res.msg || '',
								icon: 'none'
							})
							//this.msg =''
						}
					}).catch((err) => {

						uni.hideLoading()
						uni.showToast({
							title: '没有返回内容,请稍后再试!',
							icon: 'none'
						})
						this.is_submit_question = false
					})


					return false
				}
			},
			randomString(length) {
				let str = 'ABCDEFGHIJKIMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
				let num = '';
				for (let i = 0; i < length; i++) {
					num += str.charAt(Math.floor(Math.random() * str.length));
				}
				this.console_log(num);
				return num;
			},
			console_log(val) {
				this.$commonApi.console_log(val)
			},
			initGptVersions() {
				let that = this
				this.$commonApi.callFunctionAsync('ai-chat-version', {
					data:{status:1},
					orderBy: "sort asc"
				}).then((res) => {
					that.ai_chat_version_list = res.result
					if (res.result.length == 0) {
						that.gpt_version = 'gpt-3.5-turbo'
					} else if (!that.gpt_version) {
						let find = res.result
						that.cur_cost = find[0].number || 1
						that.gpt_version = find[0].key || ''
						that.gpt_name = find[0].name || ''
						//7.16新增
						that.ai_chat_api_key_sec=find[0]
						//新增
						that.maxlengthMessage = find[0].words || 3000
					}
				})
			},
			changeChatVersion() {
				let that = this
				let itemList = this.ai_chat_version_list.map(m => m.name)

				uni.showActionSheet({
					itemList: itemList,
					success: function(res) {
						let name = itemList[res.tapIndex]
						let find = that.ai_chat_version_list.filter(f => f.name == name)
						if (find.length == 0) {
							return
						}
						that.cur_cost = find[0].number || 1
						that.gpt_version = find[0].key || ''
						that.gpt_name = find[0].name || ''
						that.ai_chat_api_key_sec=find[0]
						//新增
						that.maxlengthMessage = find[0].words || 3000
					},
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	::v-deep .primary-color {
		background-color: $uni-color-primary;
	}

	.selectModuleDialog text {
		width: 600rpx;
		display: block;
		margin: 2rpx auto;
		background-color: white;
		padding: 20rpx;
		overflow: hidden;
	}

	.share {
		width: 40%;
		display: flex;
		position: fixed;
		right: 20px;
		bottom: 50px;

		.u-button,
		button {
			margin-bottom: 10px;
		}
	}

	.msg_tip {
		background-color: #FEF0F0;
		padding: 2px;
		display: flex;
		flex-direction: row;
		align-items: center;
		border-top-left-radius: 4px;
		border-top-right-radius: 4px;
		border-bottom-left-radius: 4px;
		border-bottom-right-radius: 4px;
	}

	.tool {
		width: 90%;
		margin: 15rpx auto;

		.header {
			.title {
				margin-bottom: 0rpx;
				margin-top: 5px;
				font-weight: bold;
				color: var(--global-font-color)
			}
		}

		.grid {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: space-between;

			.item {
				width: 30%;
				display: flex;
				flex-direction: column;
				align-items: center;
				background-color: #f6f6f6;
				margin: 15rpx 0rpx;
				padding: 30rpx 0rpx;
				border-radius: 10rpx;
				cursor: pointer;

				.title {
					color: var(--global-font-color);
					margin-top: 15rpx;
				}

				.desc {
					color: var(--global-font-color);
					font-size: 24rpx;
				}
			}

			.activeItem {
				.title {
					margin-top: 15rpx;
				}

				.desc {
					font-size: 24rpx;
				}
			}
		}
	}

	.alert {
		width: 90%;
		margin: 30rpx auto;
	}

	.form {
		padding-top: 20px;
		padding-bottom: 5px;
		width: 90%;
		margin: 0px auto 0px;
		z-index: 999;

		.header {
			margin-bottom: 30rpx;
			display: flex;
			flex-direction: row;
			justify-content: space-between;

			.tips {}

		}


		.panel {
			padding: 30rpx;
			background-color: #fff;
			border-radius: 15rpx;

			.head {
				display: flex;
				flex-direction: row;
				justify-content: space-between;

				.tips {
					color: #0055ff;
				}
			}

			.textarea {
				margin-top: 30rpx;
			}

			.btn-group {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				margin-top: 30rpx;

				.paste {
					width: 40%;
				}

				.get {
					width: 56%;
				}
			}
		}
	}

	.bg {
		position: fixed;
		top: 0rpx;
		left: 0rpx;
		width: 100%;
		background-color: $btn-color-primary;
		min-height: 200rpx;
		border-radius: 0rpx 0rpx 140rpx 140rpx;
		z-index: -1;
	}

	.askResultClass {
		margin-bottom: 10rpx;
		overflow: scroll;
		color: var(--global-font-color);
		padding: 10px;
	}

	.askResultClass span {
		//max-height: 200px ; overflow:scroll; 
	}


	.scroll-view_H {
		white-space: nowrap;
		width: 100%;
	}

	.scroll-view-item_H {
		display: inline-block;
		margin-right: 10px;
		width: 100%;
	}

	.sheet {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		bottom: env(safe-area-inset-bottom);
		padding: 30rpx 0rpx;
		background-color: #fff;

		.btn {
			width: 32%;

			.u-button {
				height: 90rpx;
			}
		}
	}

	//pc
	.bg {
		background-color: transparent;
	}

	@media (min-width:1024px) {
		.bg {
			background-color: transparent;
			max-width: 1024px;
		}
	}

	.askBox {
		margin: 5px auto;
	}


	.pose-list {
		margin-top: 14px;
		border-top: 1px solid #e3e3e3
	}

	.pose-list-item {
		margin: 10px 20px 0px 20px;
		padding: 8px 0px 8px 12px;
		background-color: #f5f6fb;
		border-radius: 3px;
		color: var(--global-font-color);
		font-size: 13px
	}


	.sheet {
		width: 100%;
		position: fixed;
		bottom: 0rpx;
		left: 0rpx;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		bottom: env(safe-area-inset-bottom);
		padding: 30rpx 0rpx;
		background-color: #fff;

		.btn {
			width: 32%;

			.u-button {
				height: 90rpx;
			}
		}
	}

	@media (min-width:1024px) {
		.sheet {
			max-width: 1024px;
			left: var(--window-width);
		}
	}



	.chat-setting {
		display: flex;
		background: #fff;
		margin: 10px 0;
		width: 100%;
		padding: 4rpx;
		box-sizing: border-box;
		justify-content: space-between;
		align-items: flex-end;
	}
	.uniui-bottom:before {
	    content: "👇";
	}
</style>