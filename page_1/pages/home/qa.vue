<template>
	<view class="container" :data-theme="state.app.theme">
		<view class="form">
			<view class="header">
				<view class="title">查阅之前的提问记录</view>
			</view>
			
			<view class="btn-group">
				
				<view class="btn paste" v-if="ask_history.length>0" style="margin-bottom: 10px;">
					<u-button icon="file-text" @click="clearHistoryData" text="清空记录"></u-button>
				</view>
				
			</view>
			
			
			<view class="panel" v-for="(item,index) in ask_history" :key="index" @tap="copy(item,index)" >
				<view class="head">
					<view class="title">{{item.problem}}</view>
				</view>
				<view class="content"  style="margin-bottom: 150rpx;">
					<u-parse :content="getContent(item.answer)"></u-parse>
				</view>
				<view class="bottom">
					{{$getTime(item.time)}}
					<view style="display: inline-block;margin-left: 50px; ">
						<text @click="btnMore(item)">查看更多</text>
					</view>
				</view>
			</view>
			
			<view class="title" style="text-align: center;margin-top: 100rpx;"  v-if="ask_history.length==0">暂无内容，去提问试试吧</view>
			
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				user:{},
				ask_history:[],
				state:{},
			};
		},
		onShow(){
			this.state=this.$store.state
			this.ask_history=this.uni_getStorageSync('ask_history')||[]
			//console.log(this.ask_history)
			this.ask_history.reverse()
		},
		methods: {
			copy(item,index) {
				let that=this
				uni.showActionSheet({
					itemList: ["复制内容","删除内容"],
					success: function (res) {
						switch(res.tapIndex){
							case 0:
								uni.setClipboardData({
								data: (item.problem +'\r\n'+ item.answer),
								success: function() {
									uni.showToast({
										title: '复制成功',
										icon: 'none'
									})
								}
							});
								break;
							case 1:
								that.ask_history.splice(index,1)
								that.uni_setStorageSync('ask_history',that.ask_history)
								break;
							case 2:
								break;
						}
					},
					fail: function (res) {
						console.log(res.errMsg);
					}
				});
			
				
			},
			copyContent(val) {
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
			btnMore(item){
				uni.navigateTo({
					url: '/page_1/pages/home/answer?title=' + item.problem + '&content=' + encodeURIComponent(item.answer)+'&fromHistory=1'
				})
			},
			getContent(str){
				try{
					return decodeURIComponent(str).replace(/\n/gi,"<br>")
				}catch(e){
					console.log(e)
					return str
				}
			},
			clearHistoryData(){
				this.ask_history=[]
				uni.removeStorageSync('ask_history')
				this.uni_setStorageSync('ask_history',this.ask_history)
				uni.showToast({
					title:'清空成功'
				})
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss" scoped>
	.form {
		width: 90%;
		margin: 0 auto;
		z-index: 999;

		.header {
			margin-bottom: 30rpx;

			.title {
				text-align: center;
				color: #fff;
				margin: 30rpx 0rpx;
			}
		}

		.panel {
			padding: 30rpx;
			background-color: #fff;
			border-radius: 15rpx;
			box-shadow: 0rpx 10rpx 10rpx #eee;
			margin-bottom: 15rpx;
			.bottom{
				font-size: 24rpx;
			}
			.head {
				border-bottom: 1rpx solid #eee;
				padding-bottom: 30rpx;
				.title{
					font-weight: bolder;
					font-size: 30rpx;
				}
			}
			.content{
				margin: 30rpx 0rpx;
			}
			.bottom{
				background-color: #F0FAF8;
			color:var(--global-font-color);
				padding: 15rpx;
				border-radius: 10rpx;
			}
		}
	}

	.bg {
		position: fixed;
		top: 0rpx;
		left: 0rpx;
		width: 100%;
		background-color: #26b3a0;
		min-height: 200rpx;
		border-radius: 0rpx 0rpx 140rpx 140rpx;
		z-index: -1;
	}
</style>
