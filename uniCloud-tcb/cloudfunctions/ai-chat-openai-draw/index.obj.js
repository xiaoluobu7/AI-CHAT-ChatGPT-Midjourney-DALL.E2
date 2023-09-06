// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const querystring = require('querystring');
const https = require('https');
'use strict';
const {
	userInfo
} = require('os');
let uniID = require('uni-id')
const db = uniCloud.database();
const configDb = db.collection('ai-chat-config');
const userdb = db.collection('uni-id-users')
const dbCmd = db.command
const $ = db.command.aggregate
var cryptoUtils = uniCloud.importObject('ai-chat-crypt-utils')
//默认绘画接口，需要开通mj绘画的，联系群主购买套餐，按次收费,100起充值
let drawServerAddress = 'https://weixin.bolan.link'

// 下载网络图片并上传到云存储
const downloadAndUploadImg = async function(url) {
	// 下载图片， 获取临时文件路径
	let result = await uniCloud.httpclient.request(url, {
		method: 'GET',
		timeout:100000,
		dataType: 'arraybuffer',
	})
	
	let blob = new Blob([result.data], {
		type: "image/png"
	}) 
 
	console.log('上传图片到云存储')
	// 上传图片到云存储
	let res = await uniCloud.uploadFile({
		cloudPath: new Date().getTime() + ".png",
		fileContent: blob,
	});

	console.log(`文件上传成功，文件ID：${res.fileID}`);
	console.log(res)
}

const drawImageResultMethod = async function(event) {
	//to do
	let apiUrl = ''
	let res = {}

	event.imagePlatform = event.image_platform || event.imagePlatform
	event.imagePlatform=event.imagePlatform||''
	event.imagePlatform = event.imagePlatform.toLowerCase()

	//绘画是否免费，绘画每次扣减积分
	let configs = await configDb.where({
		key: dbCmd.in(['drawServerAddress'])
	}).field({
		key: true
	}, {
		val: true
	}).get()
	if (configs) {
		for (let c of configs.data) {
			if (c.key == 'drawServerAddress' && c.val) {
				drawServerAddress = (c.val)
			}
		}
	}

	switch (event.imagePlatform) {
		default:
		case "":
			//更新进度
			await db.collection('ai-chat-draw-his')
				.where({
					draw_task_uuid: event.task_id
				})
				.update({
					progress: 100
				})
			break
		case "mj":
			//更新进度
			let hisMJ=await db.collection('ai-chat-draw-his')
				.where({
					_id: event.task_id
				}).limit(1)
				.get()
			res.data = {}	
			//是否绘画完成
			if (hisMJ.data[0].status == -1) {
				//还没有回调结果
				res.data.data = hisMJ.data[0] || {}
				res.data.data.Progress = 0
				res.data.data.errMsg = ''
				break
			}

			//结果异常
			if (hisMJ.data[0].status==0) {
				res.data.data = hisMJ.data[0] || {}
				res.data.data.Progress = 100
				res.data.data.errMsg = hisMJ.data[0].msg
				
				//绘画失败的话，退回扣减的绘画次数6.20
				let uid=hisMJ.data[0].user_uuid
				let userInfo= await userdb.where({_id:uid}).field({number_draw:true}).limit(1).get()
				if(userInfo.data.length>0){
					await userdb.doc(uid).update({number_draw:Number(userInfo.data[0].number_draw)+1})
				}

				break
			}

			res.data.data =hisMJ.data[0] || {}
			res.data.data.Progress = 100
			res.data.data.imageId = hisMJ.data[0].image_id
			res.data.data.ImagePath = hisMJ.data[0].image_url
			break
	}
	let result = {
		"code": 0,
		"text": res
	}
	var cryptoUtils = uniCloud.importObject('ai-chat-crypt-utils')
	return await cryptoUtils.encrypt(JSON.stringify(result))
}

const startJob = async function() {
	console.log('开始同步绘画进度')
	const {
		data
	} = await db.collection('ai-chat-draw-his').where({
		progress: dbCmd.lt(100)
	}).field({
		draw_task_uuid: true,
		image_platform: true,
		_id: true
	}).orderBy('_id', 'desc').get()
	let success = 0
	for (let s of data) {
		await drawImageResultMethod({
			task_id: s.draw_task_uuid,
			image_platform: s.image_platform,
			id: s._id
		})
		success += 1
	}
	console.log('结束同步绘画进度,处理数据:' + success)
	return success
}

module.exports = {
	_before: function() { // 通用预处理器

	},
	_timing: async function() {
		await startJob()
	},
	async start_draw_timer() {
		await startJob()
	},

	/**
	 * 获取绘图结果
	 * @param {Object} event
	 */
	async drawImageResult(event) {
		return drawImageResultMethod(event)
	},
	/**
	 * @param {Object} event 画图平台
	 * @result ！！！返回格式为 {"code":0,"text":[{"url":"http://xxxx"},{"url":"http://xxxx"}]}
	 */
	async drawImage(event, userInfo) {
		//to do
		let apiUrl = ''
		let success = false
		let res = {}
		let code = 0
		let uid = userInfo._id
		//是否需要异步去获取结果
		let is_async = false

		let params = {}
		let data_eve={}
		//5.25请求参数解密
		if (event.is_encry_req && event.data && typeof event.data == 'string') {
			//data解密
			try {
				let _data = await cryptoUtils.decrypt(event.data)
				event.data = JSON.parse(_data)
			} catch (e) {}
		}

		event.data = event.data || {}
		params.draw_cost = event.draw_cost || 0

		event.imagePlatform = event.imagePlatform || 'mj'
		event.imagePlatform = event.imagePlatform.toLowerCase()

		//绘画是否免费，绘画每次扣减积分
		let configs = await configDb.where({
			key: dbCmd.in(['is_free_draw', 'draw_cost_openai', 'draw_cost_mj', 'draw_appkey',
				'drawServerAddress'
			])
		}).get()
		if (configs) {
			for (let c of configs.data) {
				if (c.key == 'is_free_draw') {
					params.is_free_draw = (c.val == 'true' || c.val == 1)
				}
				if (c.key == 'draw_cost_mj') {
					params.draw_cost_mj = Number(c.val)
				}
				if (c.key == 'draw_cost_openai') {
					params.draw_cost_openai = Number(c.val)
				}
				if (c.key == 'draw_appkey') {
					params.draw_appkey = (c.val)
				}
				if (c.key == 'drawServerAddress' && c.val) {
					params.drawServerAddress = (c.val)
				} else {
					params.drawServerAddress = drawServerAddress
				}
			}
		}

		if (!params.drawServerAddress) {
			params.drawServerAddress = drawServerAddress
		}
		if (event.draw_cost > 0) {
			params.draw_cost = params.draw_cost || 1
		} else if (event.imagePlatform == 'mj') {
			params.draw_cost = params.draw_cost_mj || 1
		} else if (event.imagePlatform == 'openai') {
			params.draw_cost = params.draw_cost_openai || 1
		}

		if (event.parms) {
			event.data = event.parms
		}

		//绘画秘钥(联系开发者充值)
		event.data.appid = params.draw_appkey || ''
		//判断绘画积分是足额
		let is_free_draw = params.is_free_draw || false
		userInfo.number_draw = !userInfo.number_draw ? 0 : userInfo.number_draw
		userInfo.number = !userInfo.number ? 0 : userInfo.number
		//mj或者其他绘画，没有vip，必须按次数，不然容易亏本  && userInfo.isvip == 0
		if (false && event.imagePlatform != 'openai' && !is_free_draw && userInfo.number_draw <= 0) {
			data_eve = {
				code: 400,
				msg: "绘画次数已用尽,请联系客服购买套餐试试",
				number: userInfo.number_draw
			}
			return data_eve
		}
		if (event.imagePlatform != 'openai' && !is_free_draw && userInfo.number_draw <= 0 && userInfo.endTime &&
			new Date(userInfo.endTime) <
			new Date() && userInfo.isvip != 0) {
			data_eve = {
				code: 400,
				msg: "会员已到期,请续费哦",
				number: userInfo.number_draw,
				endTime: '过期时间：' + userInfo.endTime
			}
			return data_eve
		}

		switch (event.imagePlatform) {
			case "mj":
			
				//添加mj绘画记录
				let draw_data = event.data || {}
				draw_data.draw_task_uuid = ''
				draw_data.image_platform = event.imagePlatform
				draw_data.image_id = event.data.image_id || ''
				draw_data.image_action = event.data.image_action || ''
				draw_data.image_index = event.data.image_index || ''
				
				draw_data.publish_time = new Date().getTime()
				
				draw_data.progress = 0
				draw_data.image_path = ''
				draw_data.thumb_image_path = ''
				
				draw_data.user_name = userInfo.nickname || userInfo.username
				draw_data.user_uuid = uid
				draw_data.avatar_url = userInfo.avatar
				
				draw_data.loves = 1
				draw_data.collection = 1
				draw_data.copys = 1
				draw_data.status = -1 //-1:绘画中，0：绘画失败 1：成功
				draw_data.is_audited = -1
				
				res.data=draw_data
				
				let result_id = await db.collection('ai-chat-draw-his').add(draw_data)
				res.id = result_id.id
				is_async = true
				success = true
			
				//如果有垫图则6.15
				if(event.data.image_urls){
					event.data.prompt= event.data.image_urls+' '+event.data.prompt
				}
			
				// 发送POST请求
				const postData = querystring.stringify({
				  'key': event.data.appid,
				  'mj_action': event.data.image_action,
				  'prompt': event.data.prompt,
				  'id': event.data.image_id||'',
				  'mj_index': event.data.image_index||''
				});
				
				const postOptions = {
				  hostname: 'api.wike.cc',
				  path: '/api/painting/zsy',
				  method: 'POST',
				  headers: {
				    'Content-Type': 'application/x-www-form-urlencoded',
				    'Content-Length': Buffer.byteLength(postData)
				  }
				};
				let data = '';
				const postReq = https.request(postOptions, response => {
				  let mjRes = '';
				  response.on('data', chunk => {
					data += chunk;
				  });
				  response.on('end', () => {
					mjRes= JSON.parse(data);
					if(mjRes && mjRes.code==200){
					  //更新进度
					  db.collection('ai-chat-draw-his')
						.where({
							_id: res.id
						})
						.update({
							progress: 100,
							image_id: mjRes.data.image_id || '',
							image_id: mjRes.data.task_id || '',
							image_path: (mjRes.data.image_url || '').replace('_thumb',''),
							thumb_image_path: mjRes.data.image_url || '',
							//status:0 违规图片，不显示
							status: mjRes.data.image_url.indexOf('360X640.png') == -1 ? 1 : 0,
							msg: mjRes.msg
						})
					}else if(mjRes && mjRes.code!=200){
										  
					  db.collection('ai-chat-draw-his')
						.where({
							_id: res.id
						})
						.update({
							progress: 100,
							//status:0 违规图片，不显示
							status: 0,
							msg: mjRes.code+' '+mjRes.msg
						})
					}
				  });
				  
				});
				
				postReq.on('error', error => {
				  console.error(error);
				  db.collection('ai-chat-draw-his')
					.where({
						_id: res.id
					})
					.update({
						progress: 100,
						//status:0 违规图片，不显示
						status: 0,
						msg: error
					})
				});
				
				postReq.write(postData);
				postReq.end();

				break
			case "openai":
				try {
					res.data = event.draw_data || []
					if (res.data.length > 0) {
						success = true
						//添加mj绘画记录
						let draw_data = {}
						draw_data.draw_task_uuid = new Date().getTime()
						draw_data.prompt = event.data.prompt || event.data
						draw_data.image_platform = event.imagePlatform
						draw_data.image_id = ''
						draw_data.image_action = 'imagine'
						draw_data.image_index = ''

						draw_data.publish_time = new Date().getTime()

						draw_data.progress = 100

						draw_data.image_path = (event.draw_data[0].url||'').replace('_thumb','')
						draw_data.thumb_image_path = event.draw_data[0].url

						draw_data.user_name = userInfo.nickname || userInfo.username
						draw_data.user_uuid = uid
						draw_data.avatar_url = userInfo.avatar

						draw_data.loves = 1
						draw_data.collection = 1
						draw_data.copys = 1
						draw_data.status = 0
						draw_data.is_audited = -1

						let result_id = await db.collection('ai-chat-draw-his').add(draw_data)
						res.id = result_id.id
						is_async = false
					}
				} catch (e) {
					return {
						code: 400,
						msg: '系统接口繁忙，请稍后再试',
						error: e.message
					}
				}
				break
		}

		if (success) {
			const {
				uid,
			} = userInfo

			//扣绘画积分
			if (event.imagePlatform != 'openai') {
				await uniID.updateUser({
					uid,
					number_draw: (userInfo.number_draw || 0) - (params.is_free_draw ? 0 : params
						.draw_cost),
					drawNum: (userInfo.drawNum || 0) + 1,
				})
			}
		}

		let result = {
			is_async,
			"code": code,
			"text": res
		}
		return await cryptoUtils.encrypt(JSON.stringify(result))

	},
}