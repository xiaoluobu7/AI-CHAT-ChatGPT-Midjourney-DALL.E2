<template>
	<view class="agent">
		<view class="head">
			共 <span>{{user.invite_count||0}}</span> 人
		</view>
		<view class="t_tou">
			<view class="tou_0">头像</view>
			<view class="tou_2">昵称/ID</view>
			<view class="tou_1">注册时间</view>
		</view>
		<view class="t">
		  <view v-for="(item,index) of dataList" :key="index">
			<view class="t_01">
				<view class="tou_0">
					<image style="width: 35px;height: 35px" v-if="item.avatar" :src="item.avatar"></image>
					<image style="width: 35px;height: 35px" v-else src="/static/common/avatar.png"></image>
				</view>
				<view class="tou_2" @click="copy(item.username)" >{{item.username||item.nickname}}</view>
				<view class="tou_1" >{{getTime(item) }}</view>
			</view>
		  </view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				 user:{},
				 dataList:[]
			}
		},
		onShow(){
			this.$commonApi.is_login()
			this.user=this.uni_getStorageSync('user')
			this.getList()
		},
		methods:{
			getList(){
				this.$commonApi.user({
					action: 'get_reward_list',
					params: {
					}
				}).then((res)=>{
					this.dataList=res.data
				})
			},
			getTime(item){
				let time=this.$getTime(item.register_date)
				return time.substr(0,10)
			},
			copy(val, tip) {
				uni.setClipboardData({
					data: val,
					success: function() {
						uni.showToast({
							title: tip || '复制成功',
							icon: 'none'
						})
					}
				});
			},
		},
	}
</script>

<style lang="scss" scoped>

.agent *{
	color: var(--global-font-color);
}
.agent{
	.head{background-color: $btn-color-primary;color: #fff;text-align: center;padding: 40px 10px 30px;}
	.head span{font-size: 30px;padding: 0 5px;color: var(--global-font-color);}
	.t_tou{display: flex;padding: 10px;height: 30px;line-height: 30px;margin-bottom: 10px;}
	.tou_0{width: 20%;text-align: center;}
	.tou_1{width: 44%;text-align: center;}
	.tou_2{width: 34%;text-align: center;}
	.t_01{display: flex;height: 45px;line-height: 45px;}
	.t_01_1{text-align: center;}
	.t_01_1 img{width: 30px;height: 30px;border-radius: 30px;}
	.t li:nth-of-type(odd){ background-color: #EEEEEE;} 
	.t li:nth-of-type(even){background-color: #fff;} 

}
</style>
