const fs = require('fs');
const path = require('path')
module.exports = {
	// 统一 - 支付回调地址,格式为 "服务空间ID":"URL化地址"
	"notifyUrl": {
		// 本地开发环境-支付回调地址
		"mp-848725e2-a2cc-430f-939b-e398ae9fad5c": "https://fc-mp-848725e2-a2cc-430f-939b-e398ae9fad5c.next.bspapp.com/uni-pay-co",
		// 线上正式环境-支付回调地址
		"mp-848725e2-a2cc-430f-939b-e398ae9fad5c": "https://fc-mp-848725e2-a2cc-430f-939b-e398ae9fad5c.next.bspapp.com/uni-pay-co",
	},
	"notifyKey": "5FB2CD73C7B53918728417C50762E6D45FB2CD73C7B53918728417C50762E6D4", // 跨云函数通信时的加密密钥，建议手动改下，不要使用默认的密钥，长度保持在64位以上即可
	// 微信支付相关
	"wxpay": {
		"enable": true, // 是否启用微信支付
		// 微信 - 小程序支付
		"mp": {
			"appId": "wx23062cbfae8d460d", // 小程序的appid
			"secret": "537f5073cd25ed50ef964aac95f9bd48", // 小程序的secret
			"mchId": "1641662649", // 商户id
			"key": "doejikesnfhdyykiiiyyfdeghujkiiky", // v2的api key
			"pfx": fs.readFileSync(__dirname + '/wxpay/apiclient_cert.p12'), // v2需要用到的证书
			"v3Key": "", // v3的api key
			"appCertPath": path.join(__dirname, 'wxpay/apiclient_cert.pem'), // v3需要用到的证书
			"appPrivateKeyPath": path.join(__dirname, 'wxpay/apiclient_key.pem'), // v3需要用到的证书
			"version": 2, // 启用支付的版本 2代表v2版本 3 代表v3版本
		},
		// 微信 - APP支付
		"app": {
			"appId": "wx23062cbfae8d460d", // 微信开放平台的appid
			"secret": "537f5073cd25ed50ef964aac95f9bd48", // 微信开放平台的secret
			"mchId": "1641662649", // 商户id
			"key": "doejikesnfhdyykiiiyyfdeghujkiiky", // v2的api key
			"pfx": fs.readFileSync(__dirname + '/wxpay/apiclient_cert.p12'), // v2需要用到的证书
			"v3Key": "", // v3的api key
			"appCertPath": path.join(__dirname, 'wxpay/apiclient_cert.pem'), // v3需要用到的证书
			"appPrivateKeyPath": path.join(__dirname, 'wxpay/apiclient_key.pem'), // v3需要用到的证书
			"version": 2, // 启用支付的版本 2代表v2版本 3 代表v3版本
		},
		// 微信 - 扫码支付
		"native": {
			"appId": "wx23062cbfae8d460d", // 可以是小程序或公众号或app开放平台下的应用的任意一个appid
			"secret": "537f5073cd25ed50ef964aac95f9bd48", // secret
			"mchId": "1641662649", // 商户id
			"key": "doejikesnfhdyykiiiyyfdeghujkiiky", // v2的api key
			"pfx": fs.readFileSync(__dirname + '/wxpay/apiclient_cert.p12'), // v2需要用到的证书
			"v3Key": "", // v3的api key
			"appCertPath": path.join(__dirname, 'wxpay/apiclient_cert.pem'), // v3需要用到的证书
			"appPrivateKeyPath": path.join(__dirname, 'wxpay/apiclient_key.pem'), // v3需要用到的证书
			"version": 2, // 启用支付的版本 2代表v2版本 3 代表v3版本
		},
		// 微信 - 公众号支付
		"jsapi": {
			"appId": "wx098276de84c7b810", // 公众号的appid
			"secret": "9a93e75686e0a95d7a8d89ceee0158f7", // 公众号的secret
			"mchId": "1641662649", // 商户id
			"key": "doejikesnfhdyykiiiyyfdeghujkiiky", // v2的api key
			"pfx": fs.readFileSync(__dirname + '/wxpay/apiclient_cert.p12'), // v2需要用到的证书
			"v3Key": "", // v3的api key
			"appCertPath": path.join(__dirname, 'wxpay/apiclient_cert.pem'), // v3需要用到的证书
			"appPrivateKeyPath": path.join(__dirname, 'wxpay/apiclient_key.pem'), // v3需要用到的证书
			"version": 2, // 启用支付的版本 2代表v2版本 3 代表v3版本
		},
		// 微信 - 手机外部浏览器H5支付
		"mweb": {
			"appId": "wx098276de84c7b810", // 公众号的appid
			"secret": "9a93e75686e0a95d7a8d89ceee0158f7", // 公众号的secret
			"mchId": "1641662649", // 商户id
			"key": "doejikesnfhdyykiiiyyfdeghujkiiky", // v2的api key
			"pfx": fs.readFileSync(__dirname + '/wxpay/apiclient_cert.p12'), // v2需要用到的证书
			"v3Key": "", // v3的api key
			"appCertPath": path.join(__dirname, 'wxpay/apiclient_cert.pem'), // v3需要用到的证书
			"appPrivateKeyPath": path.join(__dirname, 'wxpay/apiclient_key.pem'), // v3需要用到的证书
			"version": 2, // 启用支付的版本 2代表v2版本 3 代表v3版本
			// 场景信息，必填
			"sceneInfo": {
				"h5_info": {
					"type": "Wap", // 此值固定Wap
					"wap_url": "https://chat.iti8.fun", // 你的H5首页地址，必须和你发起支付的页面的域名一致。
					"wap_name": "AIChat", // 你的H5网站名称
				}
			}
		},
	},

	// ios内购相关
	"appleiap": {
		// ios内购支付
		"app": {
			"password": "", // App 专用共享密钥，App 专用共享密钥是用于接收此 App 自动续期订阅收据的唯一代码。如果您要将此 App 转让给其他开发者或不想公开主共享密钥，建议使用 App 专用共享密钥。非自动续订场景不需要此参数
			"timeout": 10000, // 请求超时时间，单位：毫秒
			"sandbox": true, // 是否是沙箱环境
		},
	}
}
