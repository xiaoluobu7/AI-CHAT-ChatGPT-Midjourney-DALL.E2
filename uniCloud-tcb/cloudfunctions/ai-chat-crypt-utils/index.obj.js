// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
var crypto=require('crypto');
let key = "vZHJaB1234567890";//加密密钥，16位
let iv  = "VFjMgd1234567890";//矢量16位

	function encryptMethod(data) {
	    var cipherChunks = [];
	    var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
	    cipher.setAutoPadding(true);
	    cipherChunks.push(cipher.update(data, 'utf8', 'base64'));
	    cipherChunks.push(cipher.final('base64'));
	    return cipherChunks.join('');
	}
	
	//解密
	function decryptMethod(data) {
	    try {
	        var cipherChunks = [];
	        var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
	        decipher.setAutoPadding(true);
	        cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
	        cipherChunks.push(decipher.final('utf8'));
	        return cipherChunks.join('');
	    
	    } catch (e) {
	        console.log('解密失败，kv:'+key+'  iv'+iv)
	        console.log(data)
	        console.log(e)
	        return ''
	    }
	}
	
//返回的值类型是Promise	
module.exports = {
	_before: function () { // 通用预处理器

	},
   encrypt(data){
	   return encryptMethod(data)
   },
   decrypt(data){
   	   return decryptMethod(data)
   },
}
