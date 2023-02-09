<template>
	<view class="svg">
		<uni-nav-bar :title="notePageName"></uni-nav-bar>
		<view class="svg-box">
			<view class="svg_content">
			<img style="width: 100%;" id="DomId" :src="svgImg" mode="aspectFill" alt="" />
			</view>
			<template v-if="type == 2">
				<!-- <view class="" v-if="isIos">
					<view class="svg_down" @click="downImg(DOWNPNGURL,new Date().getTime())">下载SVG</view>
				</view> -->
				<a :href="downSvg" class="svg_down">
					<image src="../../static/down2.png" alt=""></image>下载SVG
				</a>
			</template>
		</view>
	</view>
</template>
<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from "vue";
import { userApi } from '@/api'
const downSvg = ref()
const svgImg = ref()
const downimgs = ref()
const textimg = ref()
const isIos = ref()
const DOWNPNGURL = ref()
const type = ref()
const notePageName = ref()

//接收参数
onLoad((options:any) => {
	type.value = options.type
	// notePageName.value = options.notePageName
	// 获取笔记图片、
	userApi.findNotePage(options.notePageId).then((res) => {
		if(res.code == 200) {
			svgImg.value = res.data.notePageRelatePath.remoteImgPath
			notePageName.value = res.data.notePageName
			userApi.getNotePageSvgPicture(res.data.uuid,options.type).then((res) => {
				if(res.code == 200) {
					downSvg.value = res.data.getSvgPictureS3Path
					downimgs.value = res.data.getSvgPictureServerPath
					DOWNPNGURL.value = res.data.getSvgPictureServerPath
				}else {
				}
			})
		}else if(res.code == 221){
			uni.showToast({
				title:res.message,
				icon:'none'
			})
		}
	})
	if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
		console.log(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent))
		isIos.value = true;
	} else {
		isIos.value = false;
	}
	console.log(isIos.value)
});
</script>
<style>
body{
  margin: 0 !important;
}
.uni-page-head{
	display: none !important;
}
</style>
<style scoped>
.svg{
	height: 100vh;
	position: relative;
}
.svg :deep(.uni-nav-bar-text) {
	font-weight: bold;
	font-size: 16px;
	color: #000 !important;
	text-align: center;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.svg-box {
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
}
.svg_content{
  width: 100%;
  height: auto;
}
.svg_content image {
  width: 100%;
}
.svg_down{
  text-decoration: none;
  position: absolute;
  left: 50%;
  bottom: 34px;
  transform: translate(-50%,0);
  color: #FFF;
  background: #0063FF;
  width: 269px;
  height: 50px;
  line-height: 50px;
  text-align: center;
  /* padding: 10px 16px; */
  border-radius: 8px;
  box-shadow: 0px 4px 4px rgba(10,99,255,0.2);
}
.svg_down image{
  width: 24px;
  height: 24px;
  vertical-align: middle;
}
</style>
