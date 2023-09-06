<template>
	<view class="content">
		<text selectable=true class="vision-text" space="emsp" >微信 bolanweixing</text>
		<text selectable=true class="vision-text" space="emsp" >电话 0512-67664667</text>
		<text selectable=true class="vision-text" space="emsp" >手机 17714053687</text>
		<text selectable=true class="vision-text" space="emsp" >邮箱 781617117@qq.com</text>
		<text selectable=true class="vision-text" space="emsp" >地址 苏州市高新区</text>
	</view>
</template>

<script>
  
  export default {
	data() {
		return {

		}
    },
    onLoad() {

    },

    methods: {

    }
  }
</script>

<style>

	.content {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		justify-content: left;
		align-items: left;
		padding-bottom: 32rpx;
	}
	
	.vision-text {
	
		margin: 10px 0px 0px 0px;
		font-size: 25px;
		background-color: #ffffff;
		light-height:50px;
		color: #18bc37;
		padding: 10px;
	}
</style>
