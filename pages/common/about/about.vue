<template>
    <view class="container">
		<image class="background-image" src="https://wxlogin.bolan.link/image/aboutbg.jpg" />
			<view class="content">
				<view v-for="(link,index) in links" :key="index">
					<uni-link
						:href="link.url"
						:text="link.text"
						:color="color"
						:fontSize="fontSize"
					></uni-link>
					<view class="spacer"></view>
				</view>
			</view>
		</image>
    </view>
</template>

<script>
export default {
    data() {
        return {
			fontSize: 25,
			systemInfo: {},
			links:[
				{
					url:'https://m.bolan.link',
					text:'AIChat是AI助手、AI聊天机器人。可用于聊天、问答、翻译、作词、写邮件、写周报、写作业、写文案、写论文、写情书、写诗、写小说、写代码、写脚本……'
				}
			],
			color:'#007BFF'
			
		};
    },
	onBackPress({from}) {

	},
	onNavigationBarButtonTap(e) {
		
	},
	onLoad(e) {

	},
	methods: {

	}
};
</script>

<style>
.container {
    position: relative;
}
.background-image {
    width: 100%;
    height: 1000px;

}
.content {
    position: absolute;
    top: 200px;
    left: 100px;
    right: 100px;
    bottom: 0;
}
.title {
    font-size: 30px;
    font-weight: bold;
    margin: 10px;
}
.spacer {
    height: 20px;
}
</style>