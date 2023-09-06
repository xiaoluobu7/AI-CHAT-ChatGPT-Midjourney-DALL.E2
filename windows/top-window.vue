<template>
	<view class="top-window-header">
		<navigator open-type="reLaunch" url="/pages/ai/ai_chat">
			<image src="@/static/logo.png"  style="width: 50px;height: 50px;"></image>
		</navigator>

		<custom-tab-bar class="tab-bar-flex" style="width: 200px;" direction="horizontal" :show-icon="false" :selected="current"
			@onTabItemTap="toSecondMenu" />
		<view >
			<navigator open-type="reLaunch" url="/pages/ai/ai_chat">
				<text class="logo2" space="emsp">{{startText}}AIChat：AI智能聊天机器人！</text>
			</navigator>
		</view>

		<!-- online demo menus start -->

		<!-- <uni-link class="phone-link" href="https://m3w.cn/uniapp" text="体验手机版"></uni-link>
		<uni-link class="phone-link" href="http://hellouniapp.dcloud.net.cn/pages/component/view/view"
			text="体验 vue 2.x 版"></uni-link>
		<uni-link class="phone-link" href="http://vue
		3-hellouniapp.dcloud.net.cn/pages/component/view/view" text="体验 vue 3.0 版"></uni-link>
		<svg t="1628163727478" class="new-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
			p-id="1334" width="40" height="40">
			<path
				d="M829.866667 313.6a64 64 0 0 1 64 64v213.333333a64 64 0 0 1-64 64H262.058667L168.32 746.666667v-106.666667h0.213333V377.6a64 64 0 0 1 64-64h597.333334z m-117.333334 78.293333H661.333333l-23.466666 138.56-19.2-136.533333h-51.2l34.133333 174.677333h68.266667l19.2-116.458666 17.066666 116.458666h68.266667l34.133333-174.677333h-51.2l-17.066666 138.538667-27.733334-140.544z m-151.466666 0h-125.866667v174.698667h125.866667v-36.138667h-78.933334v-38.165333h68.266667v-32.106667h-68.266667v-34.133333h78.933334v-34.133333z m-217.6 0h-70.4v174.698667H320v-128.512l32 128.512h70.4V391.893333h-46.933333v134.506667l-32-134.506667z"
				p-id="1335" fill="#d81e06"></path>
		</svg> -->

		<!-- online demo menus end -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				startText: ' ',
				selected: {
					chat: 0,
					index: 1,
					draw: 2,
					mi: 3,
					my: 4
				},
				current: 0,
				indexPage: [{
					tabBar: '/pages/ai/ai_chat',
					index: '/pages/ai/ai_chat'
				},{
					tabBar: '/pages/home/home',
					index: '/pages/home/home'
				},{
					tabBar: '/pages/ai/ai_draw',
					index: '/pages/ai/ai_draw'
				},{
					tabBar: '/pages/vip/vip_home',
					index: '/pages/vip/vip_home'
				},{
					tabBar: '/pages/me/me',
					index: '/pages/me/me'
				}]
			}
		},
		watch: {
			$route: {
				immediate: true,
				handler(newRoute) {
					const width = uni.getSystemInfoSync().screenWidth
					if (width >= 768) {
						let path = newRoute.path
						let comp
						if (path === '/') {
							comp = 'index'
							path = '/pages/home/home'
						} else {
							comp = path.split('/')[2]
						}
						this.current = this.selected[comp]
						for (const item of this.indexPage) {
							if (path === item.tabBar) {
								uni.switchTab({
									url: item.index
								})
							}
						}
					}
				}
			}
		},
		mounted() {},
		methods: {
			toSecondMenu(e) {
				const activeTabBar = '/' + e.pagePath
				for (const item of this.indexPage) {
					if (activeTabBar === item.tabBar) {
						uni.switchTab({
							url: item.index
						})
					}
				}
			}
		}
	}
</script>

<style>
	.top-window-header {
		height: 60px;
		padding: 0 15px;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		box-sizing: border-box;
		border-bottom: 1px solid #e1e1e1;
		background-color: #FFFFFF;
		color: #333;
	}

	.logo {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		flex: 1;
	}

	.logo image {
		height: 50px;
	}

	.logo text {
		margin-left: 0px;
	}

	.right-header {
		display: flex;
		flex-direction: row;
		color: #333;
	}

	.right-header-item {
		line-height: 25px;
		margin-left: 40px;
		cursor: pointer;
		font-size: 16px;
	}

	.active {
		color: #4cd964;
		border-bottom: 2px solid;
	}

	.tab-bar-flex {
		width: 360px;
		margin-left: 30px ;
		margin-right: 30px ;
		font-size: 60px;
	}

	.phone-link {
		padding-left: 20px;
		cursor: pointer;
	}

	.new-icon {
		margin-left: -3px;
		/* margin-right: 5px; */
		margin-top: -20px;
	}
	
	.logo1 {
		font-size: 30px;
		color: #ffffff;
		background-color: #b22166;
	}
	
	.logo2 {
		font-size: 17px;
		color: #18bc37;
		background-color: #ffffff;
		margin: 10px 0px 0px 0px;
	}
</style>
