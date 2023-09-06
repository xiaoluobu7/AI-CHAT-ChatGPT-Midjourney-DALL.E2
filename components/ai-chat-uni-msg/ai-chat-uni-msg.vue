<template>
	<view class="rich-text-box" :class="{'show-cursor':showCursor}" ref="rich-text-box">
		<rich-text v-if="nodes&&nodes.length" space="nbsp" :nodes="nodes"></rich-text>

		<!-- #ifdef H5 -->
		<view class="copy-box" :style="{left,top}">
			<text class="copy" @click="copy">复制</text>
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	import MarkdownIt from '@/res/markdown-it.min.js';

	// hljs是由 Highlight.js 经兼容性修改后的文件，请勿直接升级。否则会造成uni-app-vue3-Android下有兼容问题
	import hljs from "@/res/highlight/highlight-uni.min.js";

	// 引入html-parser.js库
	import parseHtml from '@/res/html-parser.js'; 

	// console.log('hljs--',hljs);
	// console.log('hljs--',hljs.getLanguage('js'));

	// 初始化 MarkdownIt库
	const markdownIt = MarkdownIt({
		// 在源码中启用 HTML 标签
		html: true,
		// 如果结果以 <pre ... 开头，内部包装器则会跳过。
		highlight: function(str, lang) {

			try {
				return '<pre class="hljs" style="padding: 5px 8px;margin: 5px 0;overflow: auto;"><code>' +
					hljs.highlightAuto(str).value +
					'</code></pre>';
			} catch (__) {
				debugger
			}

			return '<pre class="hljs" style="padding: 5px 8px;margin: 5px 0;overflow: auto;"><code>' +
				markdownIt.utils.escapeHtml(str) + '</code></pre>';
		}
	})

	export default {
		name: "msg",
		data() {
			return {
				// 悬浮的复制按钮的左边距
				left: "-100px",
				// 悬浮的复制按钮的上边距
				top: "-100px"
			};
		},
		mounted() {
			// #ifdef H5
			// web端限制不选中文字时出现系统右键菜单
			let richTextBox = this.$refs['rich-text-box']
			if (richTextBox) {
				// 监听鼠标右键事件
				richTextBox.$el.addEventListener('contextmenu', (e) => {
					// 判断是否选中了文字内容，如果没有则限制系统默认行为（禁止弹出右键菜单）
					if (!document.getSelection().toString()) {
						// console.log(e);
						// 设置悬浮的复制按钮的坐标值
						this.top = e.y + 'px'
						this.left = e.x + 'px'
						// 禁止系统默认行为（禁止弹出右键菜单）
						e.preventDefault()
					}
				})
			}
			// 监听全局点击事件，隐藏悬浮的复制按钮的坐标
			document.addEventListener('click', () => {
				this.left = "-100px"
			})
			// #endif
		},
		props: {
			// 传入的markdown内容
			md: {
				type: String,
				default () {
					return ''
				}
			},
			// 是否显示鼠标闪烁的效果
			showCursor: {
				type: [Boolean, Number],
				default () {
					return false
				}
			}
		},
		computed: {
			// 修改转换结果的html值 用于正确给界面增加鼠标闪烁的效果
			html() {
				try{
					let tmp_md= decodeURIComponent(this.md)
					// 判断markdown中代码块标识符的数量是否为偶数
					if(tmp_md.split("```").length%2){
						return markdownIt.render(tmp_md + ' \n <span class="cursor">|</span>');
					}else{
						return markdownIt.render(tmp_md) + ' \n <span class="cursor">|</span>';
					}
				}catch(e){
					debugger
				}
				
			},
			nodes() {
				// return this.html
				// console.log('parseHtml(this.html)',parseHtml(this.html));
				// HTML String 类型转换 避免内部转换导致的性能下降。
				try{
					return parseHtml(this.html)
				}catch(e){
					return  decodeURIComponent (this.md)
				}
			}
		},
		methods: {
			// #ifdef H5
			// #endif
			// 复制文本内容到系统剪切板
			copy() {
				uni.setClipboardData({
					data:  decodeURIComponent(this.md),
					showToast: false,
				})
				// 设置悬浮的复制按钮的坐标值，使其隐藏
				this.left = "-100px"
			}
		}
	}
</script>

<style lang="scss">
	/* #ifndef VUE3 && APP-PLUS */
	@import "@/components/ai-chat-uni-msg/ai-chat-uni-msg.scss";
	/* #endif */
</style>