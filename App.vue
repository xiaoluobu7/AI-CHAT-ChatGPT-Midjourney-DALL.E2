<script>
	import requestTool from '@/common/requestTool.js'
	import {
		themeCache
	} from '@/common/constants.js'

	import {
		mapActions,
		mapMutations
	} from 'vuex'

	export default {
		onLaunch: async function() {
			let theme = uni.getStorageSync(themeCache.theme) || 'day-theme'
			this.SET_THEME(theme)
			this.SET_USER(requestTool.uni_getStorageSync('user'))
			this.$commonApi.changeTheme(theme)
			//加载配置
			await this.initConfig()
		},
		onShow: function() {
			
			let theme = uni.getStorageSync(themeCache.theme) || 'day-theme'
			this.SET_THEME(theme)
			this.$commonApi.changeTheme(theme)
		},
		onHide: function() {
			
		},
		methods: {
			...mapMutations('app', ['SET_THEME', 'SET_CONFIGS', 'SET_USER']),
			//6.1加载最新配置
			initConfig() {
				try {
					uniCloud.callFunction({
						name: 'ai-chat-get-list',
						data: {
							moduleName: 'ai-chat-config',
							is_encry: 1
						}
					}).then((res) => {
						uni.setStorageSync('ai_chat_config', res.result)
						//未登陆情况下，非首页地址，统一跳转到首页6.3
						if (!uni.getStorageSync('user')) {
							let caches = requestTool.uni_getStorageSync('ai_chat_config')
							let find = caches.filter(f => f.key == 'ai_chat_home_page' && f.val)
							let ai_chat_home_page = find.length == 0 ? '' : find[0].val
							let cur = getCurrentPages()
							if (ai_chat_home_page && ai_chat_home_page != cur[cur.length - 1].route) {
								uni.reLaunch({
									url: ai_chat_home_page
								})
							}
						}

					}).catch((err) => {
						console.log(err)
					})

				} catch (e) {
					console.log(e)
				}
			}
		},
	}
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/uni_modules/uview-ui/index.scss";

	page {
		font-size: 28rpx;
	}

	uni-page-body {
		
	}
	
	html {
		font-size: 12.8px
	} 
</style>