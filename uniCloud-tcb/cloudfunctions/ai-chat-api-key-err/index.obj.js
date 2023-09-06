// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129

//根据错误来更新appkey
const db = uniCloud.database();

const formatTime= function(msd){
	let date =msd?new Date(msd):new Date()
	let y = date.getFullYear();
	let MM = date.getMonth() + 1;
	MM = MM < 10 ? ('0' + MM) : MM;
	let d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	let h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	let m = date.getMinutes();
	m = m < 10 ? ('0' + m) : m;
	let s = date.getSeconds();
	s = s < 10 ? ('0' + s) : s;
	return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
}

module.exports = {
	_before: function () { // 通用预处理器

	},
	/**
	 * @param {Object} content 错误的json对象
	 * @param {Object} apikey  调用的apikey，用户更新这个key的状态
	 */
	async updateStatus(content,apikey){
		console.log('apikey:'+apikey+'异常，原因：'+JSON.stringify(content))
		if(!apikey){
			return ''
		}
		let obj =content
		if(obj && !obj.error){
			return content
		}
		//判断异常
		let error=obj.error
		//记录异常5.27
		await db.collection('ai-chat-api-key-err').add({
			apikey:apikey,
			create_time: formatTime(),
			msg:JSON.stringify(error)
		})
		
		if((error.message||'').toString().indexOf('You exceeded your current quota')>-1
				|| (error.message||'').toString().indexOf('Your access was terminated')>-1){
			//没有余额
			let flag= await db.collection('ai-chat-api-key').where({is_open: 1,apikey:apikey}).update({
				//Used: gpt_account.data.resmsg.total_used,
				//surplus: gpt_account.data.resmsg.total_available,
				is_open: 0,
				msg: JSON.stringify(error)
			})
			return '平台apikey账号失效，请稍后再试'
		}
		if((error.code||'').toString().indexOf('account_deactivated')>-1 ||
		(error.code||'').toString().indexOf('invalid_api_key')>-1 
		){
			//账号被封了
			let flag= await db.collection('ai-chat-api-key').where({is_open: 1,apikey:apikey}).update({
				//Used: gpt_account.data.resmsg.total_used,
				//surplus: gpt_account.data.resmsg.total_available,
				is_open: 0,
				msg: JSON.stringify(error)
			})
			return '平台apikey账号异常，请稍后再试'
		}
		
		if(error.code){
			//其他错误
			let flag= await db.collection('ai-chat-api-key').where({is_open: 1,apikey:apikey}).update({
				//Used: gpt_account.data.resmsg.total_used,
				//surplus: gpt_account.data.resmsg.total_available,
				//is_open: 0,
				msg: JSON.stringify(error) 
			})
		}
		return '抱歉，使用人数较多，请重试。感谢耐心等待'
	},
}
