<template>
	<view style="overflow-x: hidden;" class="page">

		<view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
			<image class="nav-back" ></image>
			<text class="nav-title">会员中心</text>
			<view class="nav-space"></view>
		</view>

		<view class="info" :style="{marginTop: statusBarHeight + 44 + 'px'}">
			<image style="max-height: 200px;" class="info-bg" src="/static/vip/vip-bg.png" mode="widthFix"></image>

			<view class="info-content">
				<view class="info-avatar">
					<image class="info-avatar-pic" :src="user.avatar" mode="widthFix"></image>
				</view>
				<view class="info-name">
					<text class="info-name">{{user.username || user.nickname}}</text>
					<text
						class="info-level">{{ user.isvip == 1 && user.endTime ? `会员到期时间：${$getTime(user.endTime)}` :( user.isvip == 1?"已是会员":"开通会员不限次数")}}</text>
				</view>
			</view>

			<view class="info-asset">
				<view class="info-asset-item">
					<text class="iai-title">已用次数</text>
					<text class="iai-value">{{user.openNum||0}}</text>
				</view>
				
				<view class="info-asset-item" v-if="ai_chat_open_free_chat">
					<text class="iai-title">剩余次数</text>
					<text  class="iai-value">不限</text>
				</view>
				
				<view class="info-asset-item" v-if="!ai_chat_open_free_chat">
					<text class="iai-title">剩余次数</text>
					<text v-if="user.isvip != 1" class="iai-value">{{(user.number<=0?0:user.number) || 0}}</text>
					<text v-if="(user.isvip == 1 && !user.isExpired)" class="iai-value">不限</text>
					<text v-if="user.isvip == 1 && user.isExpired"
						class="iai-value">{{(user.number<=0?0:user.number) || 0}}</text>
				</view>
				
				<view class="info-asset-item" >
					<text class="iai-title">绘画余次</text>
					<text class="iai-value">{{(user.number_draw<=0?0:user.number_draw) || 0}}</text>
				</view>
				 
			</view>
		</view>
		
		<view style="margin: 30px 0 30px 0;">
		</view>

		<scroll-view scroll-x v-if="openPay">
			<view class="recharge">
				<view class="recharge-item" :class="current == index ? 'recharge-item-active': ''"
					v-for="(item, index) in ai_chat_plan_var" :key="index" :style="{marginLeft: !index ? '30rpx': ''}"
					@click="rechargeChange(index)">
					<view class="recharge-tag" v-if="item.show == 1">
						<text class="recharge-tag-text">畅享无限对话</text>
					</view>
					<text class="recharge-item-duration">{{ item.vip_name }}</text>
					<view class="recharge-item-price">
						<text class="rmb">￥</text>
						<text class="recharge-item-price-text">{{ item.vip_price }}</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<view v-if="!isNotShowPayButton">
			<!-- #ifdef MP-WEIXIN || APP  || MP || MP-TOUTIAO -->
			<view v-if="openPay && !is_ios" @click="updateNow" class="button update" hover-class="hover">
				<text class="button-text">{{user.isvip == 1 ? `立即续费` :"立即开通"}}</text>
			</view>

			<view v-if="openPay && is_ios && openPay_ios" @click="updateNow" class="button update" hover-class="hover">
				<text class="button-text">{{user.isvip == 1 ? `立即续费` :"立即开通"}}</text>
			</view>

			<view v-if="openPay && is_ios && !openPay_ios" @click="inputDialog" class="button update"
				hover-class="hover">
				<text class="button-text">iOS手机用户 联系客服充值</text>
			</view>

			<button @click="inputDialog" v-if="!openPay" class="button update" hover-class="hover">
				<text class="button-text">联系客服充值</text>
			</button>
			<!-- #endif -->


			<!-- #ifdef H5 -->
			<view v-if="!openPay" class="button update" hover-class="hover"
				@click="inputDialog">
				<text class="button-text">{{user.isvip == 1 ? `兑换码充值` :"兑换码充值"}}</text>
			</view>
			
			<view v-if="openPay" class="button update" hover-class="hover"
				@click="updateNow">
				<text class="button-text">{{user.isvip == 1 ? `立即续费` :"立即开通"}}</text>
			</view>
			<!-- #endif -->
		</view>

		<view style="width:90%;margin: 0 auto;text-align: center">
			<view v-if="(!openPay ||  (ai_chat_plan_var && ai_chat_plan_var.length ==0) ) && ai_chat_wx_qr_code">
				<image :show-menu-by-longpress="true" @click="previewImage" style="width:90%;" :src="ai_chat_wx_qr_code"
					mode="widthFix"></image>
			</view>
		</view>

		<view style="margin: 30px 0 30px 0;">
		</view>

		<view class="privilege">
			<view class="privilege-item" v-for="(item, index) in privilegeList" :key="index" hover-class="hover"
				@click="privilegeClick(index)">
				<image class="privilege-item-pic" :src="item.pic" mode=""></image>
				<text class="privilege-item-text">{{ item.text }}</text>
			</view>
		</view>

		<uni-pay  v-if="openPay" ref="uniPay" :debug="true"  return-url="/pages/order-detail/order-detail" 
		@mounted="onMounted" @success="onSuccess"  @create="onCreate"></uni-pay>

		<uni-popup ref="inputDialog" type="dialog">
			<uni-popup-dialog ref="inputClose" mode="input" title="联系客服购买兑换码" placeholder="请输入会员兑换码"
				@confirm="dialogInputConfirm"></uni-popup-dialog>
		</uni-popup>


	</view>
</template>

<script>
	const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
	export default {
		data() {
			return {
				openPay: false,
				statusBarHeight,
				current: -1,
				privilegeList: [{
						pic: '/static/vip/infinite.png',
						text: '不限次数'
					},
					{
						pic: '/static/vip/qa.png',
						text: '极速问答'
					},
					{
						pic: '/static/vip/new.png',
						text: '功能上新'
					},
					{
						pic: '/static/vip/onlinedraw.png',
						text: '在线绘图'
					},
					{
						pic: '/static/vip/active.png',
						text: '专享功能'
					},
					{
						pic: '/static/vip/share.png',
						text: '分享赚钱'
					},
					{
						pic: '/static/vip/zhekou.png',
						text: '专享折扣'
					},
					{
						pic: '/static/vip/fanli.png',
						text: '更多返利'
					},
					{
						pic: '/static/vip/fuli.png',
						text: '折扣福利'
					},
					{
						pic: '/static/vip/kefu.png',
						text: '专属客服'
					}
				],
				ai_chat_plan_var: [],
				order_no: "",
				out_trade_no: "",
				description: "会员充值", // 支付描述
				type: "test",//回调通知接口名称，请勿修改（5.8）,对应js（uni_modules\uni-pay\uniCloud\cloudfunctions\uni-pay-co\notify\test.js）
				user: {},
				ai_chat_wx_qr_code: '',
				openPay_ios: false, //ios是否开通支付
				is_ios: false,
				is_wx_alipay_browser: false, //是否自带的支付客户端（微信，支付宝）
				isNotShowPayButton:false,
				ai_chat_open_free_chat:false,
				
				loading: false, // 支付按钮是否在loading中
				disabled: true, // 支付按钮是否禁用，避免页面未加载完成就点击支付
			}
		},
		onLoad() {
			//检测用户是否登录
			this.$commonApi.is_login()
			this.$commonApi.ai_chat_plan().then((res) => {
				let tmp  =  res.data || res
				//排序
				var compare = function (prop) {
				    return function (obj1, obj2) {
				        var val1 = obj1[prop];
				        var val2 = obj2[prop];
				        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
				            val1 = Number(val1);
				            val2 = Number(val2);
				        }
				        if (val1 < val2) {
				            return -1;
				        } else if (val1 > val2) {
				            return 1;
				        } else {
				            return 0;
				        }            
				    } 
				}
				//tmp.sort(compare("vip_price"))
				this.ai_chat_plan_var=tmp
			})
			this.userInfo()
			this.is_ios = uni.getSystemInfoSync().platform == 'ios'

			// #ifdef H5
			var ua = navigator.userAgent.toLowerCase();
			if (ua.match(/MicroMessenger/i) == "micromessenger") {
				this.is_wx_alipay_browser = true
			}
			// #endif
		},
		onShow() {
			//检测用户是否登录
			this.$commonApi.is_login()
			this.userInfo()
			this.get_ai_chat_config()
			this.isNotShowPayButton=this.$commonApi.configs.isNotShowPayButton
			this.ai_chat_open_free_chat=this.$commonApi.configs.ai_chat_open_free_chat
		},

		methods: {
			// 支付组件加载完毕后执行
			onMounted(insideData){
				this.init();
			},
			// 初始化
			async init() { 
				this.disabled = false;
				//if (this.$refs.uniPay && this.$refs.uniPay.appleiapRestore) {
					// ios内购支付漏单重试
				//	this.$refs.uniPay.appleiapRestore();
				//}
			},
			
			//
			inputDialog() {
				this.$refs.inputDialog.open()
			},
			get_ai_chat_config() {
				//
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

					this.openPay = false
					for (let s of res) {
						if (s.key == 'is_open_pay' && !(!s.val)) {
							this.openPay = true
							break
						}
					}

					//ios是否支付
					this.openPay_ios = false
					for (let s of res) {
						if (s.key == 'is_openPay_ios' && !(!s.val)) {
							this.openPay_ios = true
							break
						}
					}
					
					// #ifdef APP || APP-PLUS || APP-NVUE || APP-PLUS-NVUE || APP-VUE
					//app设备默认开启
					this.is_ios = uni.getSystemInfoSync().platform == 'ios'
					this.openPay_ios = this.is_ios
					// #endif

				})
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
					this.user.isExpired = this.user.endTime && new Date(this.user.endTime) < new Date()
					this.uni_setStorageSync('user', this.user);
					//console.log(res);;
				})
			},
			buyCard() {
				uni.showToast({
					title: '联系客服购买次数'
				})
			},
			rechargeChange(index) {
				this.current = index
			},
			onCreate(res) {
				//console.log('create: ', res);
			},
			onSuccess(res) {
				if (!this.openPay) {
					return false
				}
				if (res.user_order_success) {
					// out_trade_no, // 支付插件订单号
					// transaction_id, // 支付平台订单号

					//console.log(res);;
					// 代表用户已付款，且你自己写的回调成功并正确执行了
					this.$commonApi.ai_chat_pay({
						type: 'suss',
						out_trade_no: res.out_trade_no,
						transaction_id: res.transaction_id,
						vip_month: this.ai_chat_plan_var[this.current].vip_month,
						is_open: this.ai_chat_plan_var[this.current].is_open,
						
						vip_id: this.ai_chat_plan_var[this.current]._id,//新增套餐id字段
						charge_type:this.ai_chat_plan_var[this.current].charge_type ||'',//新增套餐类型字段6.9
					}).then((res) => {
						this.userInfo()
						//console.log(res);;
					})
				} else {
					this.$commonApi.ai_chat_pay({
						type: 'err',
						out_trade_no: res.out_trade_no,
						transaction_id: res.transaction_id,
						vip_month: this.ai_chat_plan_var[this.current].vip_month,
						is_open: this.ai_chat_plan_var[this.current].is_open,
						
						vip_id: this.ai_chat_plan_var[this.current]._id,//新增套餐id字段
						charge_type:this.ai_chat_plan_var[this.current].charge_type ||'',//新增套餐类型字段6.9
					}).then((res) => {
						this.userInfo()
						//console.log(res);;
					})
					// 代表用户已付款，但你自己写的回调执行失败（通常是因为你的回调代码有问题）

				}
			},
			updateNow() {
				if(this.current<=-1){
					uni.showToast({
						title:'请选择会员套餐'
					})
					return false 
				}
				// #ifdef MP
				this.updateNowMethod('wxpay')
				// #endif

				// #ifdef MP-ALIPAY
				this.updateNowMethod('alipay')
				// #endif
				
				// #ifdef H5
				if (/MicroMessenger/.test(window.navigator.userAgent)) {
					this.updateNowMethod('wxpay')
				} else if (/AlipayClient/.test(window.navigator.userAgent)) {
					this.updateNowMethod('alipay')
				} else {
					//新增H5
					this.updateNowMethod('wxpay')
				}
				// #endif


				// #ifdef APP || APP-PLUS || APP-NVUE || APP-PLUS-NVUE || APP-VUE
				let that = this
				//app,如果是ios，走ios支付哦,6.5
				if(this.is_ios){
					this.updateNowMethod('appleiap')
					return 
				}
				
				let config_paymethods = (this.$commonApi.configs.pay_providers || '微信').split(',')
				if (config_paymethods.length == 0 || !config_paymethods[0]) {
					uni.showToast({
						title: '平台未开通支付功能'
					})
					return
				}
				uni.showActionSheet({
					itemList: config_paymethods,
					success: function(res) {
						let paymentName = config_paymethods[res.tapIndex] || ''
						if (paymentName.indexOf('微信') > -1) {
							that.updateNowMethod('wxpay')
							return
						}
						if (paymentName.indexOf('支付宝') > -1) {
							that.updateNowMethod('alipay')
							return
						}
						uni.showToast({
							title: '暂不支持' + paymentName + '支付'
						})
					}
				})
				// #endif

			},
			updateNowMethod(pay_provider) {
				if (!this.openPay) {
					return false
				}
				let that=this 
				let openid = this.$commonApi.get_openid() || ''
				let user = this.uni_getStorageSync('user');
				this.order_no = `od-` + user.uid.substr(0, 6) + '-' + Date.now();
				this.out_trade_no = `${this.order_no}-1`;
				
				//6.5
				let pay_type=this.type //非ios支付是走test.js ，this.type不要修改，避免支付问题
				// #ifdef APP || APP-PLUS || APP-NVUE || APP-PLUS-NVUE || APP-VUE
				if(this.is_ios){
					pay_type= "appleiap"
				}
				// #endif
				// 发起支付 wxpay,alipay,appleiap
				//参考文档：https://www.jianshu.com/p/cbed1fc80d73
				this.$refs.uniPay.createOrder({
					provider: pay_provider || 'wxpay', // 支付供应商
					total_fee: parseInt(this.ai_chat_plan_var[this.current].vip_price * 100), // 支付金额，单位分 100 = 1元
					order_no: this.order_no, // 业务系统订单号（即你自己业务系统的订单表的订单号）
					out_trade_no: this.out_trade_no, // 插件支付单号
					
					productid:this.ai_chat_plan_var[this.current].productid,//ios支付才有的，产品id ，6.5新增
					description: this.ai_chat_plan_var[this.current].vip_name, //套餐描述，6.5修改
					type: pay_type, // 支付回调类型（默认是test路由,可自定义，iosapp填写appleiap）
					openid: openid||'', //openid H5用到
					useranme: this.user.username, //用户名
					uid: this.user.uid,
					
					//新增5.12
					vip_month: this.ai_chat_plan_var[this.current].vip_month,//充值时间，次数
					is_open: this.ai_chat_plan_var[this.current].is_open,//是否时间
					//6.9
					vip_id: this.ai_chat_plan_var[this.current]._id ||'',//新增套餐id字段6.9
					charge_type:this.ai_chat_plan_var[this.current].charge_type ||'',//新增套餐类型字段6.9
				});
			},
			privilegeClick(index) {
				return
				uni.showToast({
					icon: "none",
					title: `点击了「${this.privilegeList[index].text}」`
				})
			},
			back() {
				//处理刷新后不能返回上一页问题
				let canNavBack = getCurrentPages()
				if (canNavBack && canNavBack.length > 1) {
					uni.navigateBack()
				} else {
					history.back();
				}
			},
			dialogInputConfirm(e) {
				let user = this.uni_getStorageSync('user');
				this.$commonApi.ai_chat_redeem_code({
					openid: user.openid,
					code: e
				}).then((res) => {
					this.userInfo()
					if (res.code == 200) {
						//this.userInfo()
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				})
			},

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
					success: res => {},
					fail: err => {}
				});
			},



		}
	}
</script>

<style lang="scss" scoped>

	.main-title {
		padding: 30rpx 30rpx;
		font-size: 34rpx;
		color: #e9c691;
	}

	.tip {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
	color:var(--global-font-color);
	}

	.rmb {
		font-size: 26rpx;
	color:var(--global-font-color);
	}

	.bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 400rpx;
		z-index: -2;

		&-img {
			width: 100%;
			height: 100%;
		}
	}

	.hover {
		opacity: 0.7;
	}

	.nav {
		position: fixed;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 750rpx;
		height: 44px;
		padding: 0 30rpx;
		background-image: url('~@/static/vip/nav-bg.png');
		background-size: 100%;
		z-index: 99;

		&-back {
			width: 20rpx;
			height: 40rpx;
		}

		&-title {
			color: #FFFFFF;
			font-size: 42rpx;
		}

		&-space {
			width: 70rpx;
			height: 40rpx;
		}
	}

	.info {
		position: relative;
		padding: 0 15rpx;
		width: 730rpx;
		height: 360rpx;

		&-bg {
			position: absolute;
			width: 730rpx;
			height: 360rpx;
			z-index: -1;
		}

		&-content {
			padding: 70rpx 50rpx 0 50rpx;
			margin-bottom: 50rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		&-avatar {
			margin-right: 30rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			width: 85rpx;
			height: 85rpx;
			background-color: #fff;
			padding: 1rpx;
			border-radius: 50%;

			&-pic {
				width: 83rpx;
				height: 83rpx;
			}
		}

		&-name {
			display: flex;
			flex-direction: column;
			color: #FFFFFF;
			font-size: 35rpx;
		}

		&-level {
			margin-top: 15rpx;
			font-size: 24rpx;
		}

		&-asset {
			padding: 0 50rpx;
			display: flex;
			flex-direction: row;
			align-items: center;

			&-item {
				display: flex;
				flex-direction: column;
			}
		}
	}

	.iai {
		&-title {
			margin-bottom: 20rpx;
			margin-right: 100rpx;
			font-size: 24rpx;
			color:#FFFFFF;
		}

		&-value {
			font-size: 35rpx;
			color: #FFFFFF;
			padding-left: 20rpx;
		}
	}

	.recharge {
		position: relative;
		margin-bottom: 35rpx;
		display: flex;
		flex-direction: row;
		align-items: center;

		&-tag {
			position: absolute;
			top: -2rpx;
			left: -2rpx;
			width: 200rpx;
			overflow: hidden;
			height: 36rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			background-image: url('~@/static/vip/tag.png');
			background-size: 100%;

			&-text {
				font-size: 20rpx;
				color: #FFFFFF;
				text-align: center;
			}
		}

		&-item {
			position: relative;
			padding: 40rpx 0;
			margin-left: 15rpx;
			min-width: 200rpx;

			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			border: solid 2rpx #EDD2A9;
			border-radius: 12rpx;

			&-active {
				border-color: #EDD2A9;
				background-color: #FBF1E5;
			}

			&-duration {
				margin-bottom: 30rpx;
				font-size: 26rpx;
			color:var(--global-font-color);
			}

			&-price {
				margin-bottom: 20rpx;
				display: flex;
				flex-direction: row;
				align-items: baseline;

				&-text {
					font-size: 48rpx;
				color:var(--global-font-color);
				}
			}

			&-des {
				font-size: 22rpx;
			color:var(--global-font-color);
			}
		}
	}

	.button {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 85rpx;
		border-radius: 50rpx;
		background-image: linear-gradient(#EFCF9E, #E4BF85);

		&-text {
			font-size: 30rpx;
		color:var(--global-font-color);
		}
	}

	.update {
		margin: 35rpx 30rpx 20rpx 30rpx;
	}

	.privilege {
		padding: 0 30rpx;
		margin-bottom: 40rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-around;
		flex-wrap: wrap;

		&-item {
			margin: 0 23rpx;
			margin-bottom: 25rpx;
			display: flex;
			flex-direction: column;
			align-items: center;

			&-pic {
				width: 80rpx;
				height: 80rpx;
				margin-bottom: 20rpx;
			}

			&-text {
				font-size: 24rpx;
			color:var(--global-font-color);
			}
		}
	}

	.level {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 750rpx;
		height: 466rpx;
		background-size: 100%;

		&-rate {
			position: absolute;
			top: 43rpx;
			left: 33rpx;
			display: flex;
			flex-direction: row;
			align-items: center;

			&-text1 {
				margin-right: 20rpx;
			color:var(--global-font-color);
				font-size: 34rpx;
			}

			&-text2 {
				font-size: 34rpx;
			color:var(--global-font-color);
			}
		}

		&-info {
			// position: absolute;
			// top: 188rpx;
			// left: 350rpx;
			margin-top: 70rpx;
			display: flex;
			flex-direction: column;
			align-items: center;

			&-icon {
				margin-bottom: 20rpx;
				width: 48rpx;
				height: 38rpx;
			}

			&-text {
				margin-bottom: 20rpx;
				font-size: 26rpx;
			color:var(--global-font-color);
			}

		}

		&-distance {
			position: absolute;
			left: 30rpx;
			right: 30rpx;
			bottom: 35rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;

			&-text {
				font-size: 26rpx;
			color:var(--global-font-color);
			}

			&-button {
				padding: 0 30rpx;
				height: 60rpx;
			}
		}
	}

	@media (min-width:1024px) {
		body,
		.uni-tabbar,
		.uni-header,
		.uni-page-head,
		.bg,
		.nav {
			max-width: 810px;
			margin: 0 auto
		}
	}
</style>
