import Vue from 'vue'
import App from './App'

//新增
import store from './store'

import commonApi from './common/common'

//加密，解密
Vue.prototype.aes_encrypt = commonApi.aes_encrypt;
Vue.prototype.aes_decrypt = commonApi.aes_decrypt;

Vue.prototype.uni_getStorageSync = commonApi.uni_getStorageSync
Vue.prototype.uni_setStorageSync = commonApi.uni_setStorageSync


import uView from '@/uni_modules/uview-ui'
Vue.use(uView)
Vue.prototype.$commonApi = commonApi

Vue.config.productionTip = false

Vue.prototype.$getTime = (msd) => {
	let date = new Date(msd);
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


App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()

