<template>
	<view class="pageSvg">
		<view class="pageSvg_box" v-if="isshowNoteImg">
			<image class="bgnotepage" mode="widthFix" :style="{height: canvasWH.height+'px'}" :src="bgImage" @load="imageHanlder"></image>
			<canvas :style="{width: canvasWH.width+'px',height: canvasWH.height+'px'}" canvas-id="myCanvas" id="canvas"></canvas>
		</view>
		<view class="noteImgs" v-else>
			<image class="" mode="widthFix" :src="noteImg" @load="imageHanlder"></image>
		</view>
		<view class="pageSvg_play">
			<view class="pageSvg_play_img">
				<image @click="toplay" :src="payimgsrc" mode=""></image>
			</view>
			<view class="pageSvg_play_jd">
				<progress :percent="pgList" border-radius="2" activeColor="#0063ff" @activeend="progressHandel" stroke-width="3" />
			</view>
		</view>	
	</view>
</template>
<script setup lang="ts">
	import { onLoad,onUnload } from '@dcloudio/uni-app'
	import { userApi } from '@/api'
	import { user } from '@/store'
	import { onMounted, ref, getCurrentInstance, reactive,onUnmounted} from 'vue';
 	let app = getCurrentInstance()
	const store = user()
	let collectData = ref([1])
	let flat = ref(false) // 控制右下角...
	let popup_delete  = ref() // 删除弹窗
	let popup_share  = ref() // 分享弹窗
	let bgImage = ref('');	// 背景图
	let timer:any = ref(0) // 定时器
	let canvasNuM= ref(0)
	let noteImg= ref() // 笔记图片
	let isshowNoteImg= ref(false) // 控制显示canvs和笔记图片
	let progressValue= ref(0)
	let payimgsrc= ref('../../static/play.png') // 暂停播放图片
	let isSvgFlat= ref(false)
	let dataListLength = ref(0); // svg数组总长度
	let dataList = ref() // svg数组
	let proesss = ref(0) // 进度条
	let pgList = ref<string | number>(100) // 进度条百分比
	var ctx = uni.createCanvasContext('myCanvas'); // canvas 
	let playsvg:any = ref(false) // 记录播放暂停坐标点状态
	let option = reactive({})
	let canvasWH:any = ref({
		width: '',
		height: ''
	}) // canvas宽高
	let imageWH:any = {
		width: '',
		height: ''
	} // 图片的宽高
	let screenWH:any = {
		wid: '',
		hig:''
	} // 设备尺寸
	//接收参数
	onLoad((options:any) => {
		option = options
		console.log(option)
		uni.setNavigationBarTitle({ title: options.notePageName }); // 笔记名称
		// 获取笔记图片
		userApi.findNotePage(options.notePageId).then((res) => {
			if(res.code == 200) {
				noteImg.value = res.data.notePageRelatePath.remoteImgPath
				// 获取背景图
				userApi.getNotePageBackgroundToId(res.data.backgroundId).then((res) => {
					if(res.code == '200') { 
						bgImage.value = res.data.backgroundImgPath
					}else{
						bgImage.value = ''
					}
				})
			}
		})
		getCanvasData()
	});
	const getCanvasData = () => {
		// 获取canvas坐标点
		userApi.getOriginalDataJsonDownload(option.notePageId).then((res) => {
			if(res.code == '200') {
				if(!res.data.originalDataJsonDownloadPath) {
					uni.getSystemInfo({	// 获取用户设备宽高
						success(user) {
							uni.showToast({
								title:String(user.windowWidth),
								icon:'error'
							})
							bgImageError(user.windowWidth,user.windowHeight-56)
							uni.showToast({
								title:'暂无绘画内容',
								icon:'error'
							})
						}
					})
					return
				}
				collectData.value = res.data;
				uni.showLoading({
					title: '加载中'
				});
				userApi.text(res.data.originalDataJsonDownloadPath).then((ress) => {
					console.log(ress)
					dataList.value = ress.drawPaths[0]
					uni.getSystemInfo({	// 获取用户设备宽高
						success(user) {
							console.log(user)
							// bgImage.value == '' ? bgImageError(user.windowWidth,user.windowHeight-56) : ''
							screenWH = { // 设备宽高坐标点屏幕的百分比
								wid: user.windowWidth/ress.canvas.width,
								hig: user.windowWidth/imageWH.width*(imageWH.height-12)/(ress.canvas.height-12)
							}
							canvasWH.value = {
								width: user.windowWidth,
								height: user.windowWidth/imageWH.width*imageWH.height
							}
						},
						fail(err) {
							canvasWH.value = {
								width: '375',
								height: '611'
							}
						}
					})
					// 获取所有坐标点的数组长度，用于进度条计算
					ress.drawPaths[0].drawPaths.forEach((item:any) => {
						dataListLength.value = dataListLength.value + item.paths.length
					});
					uni.hideLoading();
					// toplay()
				}).catch((req) => {
					uni.showToast({ title:req, icon:'error' })
				})
			}else {
				uni.showToast({ title:'请求失败', icon:'error' })
			}
		}).catch(() => {
			uni.showToast({ title:'网络错误', icon:'error' })
		})
	}
	const bgImageError = (width:any,height:any) => {
		imageWH = {
			width: width,
			height: height
		}
	}
	onUnmounted(() => {
		clearTimeout(timer.value);
		uni.hideLoading();
	})
	onUnload(() =>{
		clearTimeout(timer.value);
		uni.hideLoading();
	} )
	// 获取图片的宽高
	const imageHanlder= (e:any) => {
		imageWH = {
			width: e.detail.width,
			height: e.detail.height
		}
	}
	// 显示分享删除弹窗
	const showShareDaiog = () => { flat.value = flat.value ? false : true }
	
	// 显示删除弹窗
	const showDeleteDaiog = () => { 
		popup_delete.value.open();
		 flat.value = false;
		 console.log('删除弹窗')
	}
	
	// 关闭删除弹窗
	const close = () => { popup_delete.value.close() }
	
	// 确认删除弹窗
	const confirm = () => {
		console.log('删除弹窗弹窗2222222')
		userApi.delNotePage(option.notePageId).then((res) => {
			if(res.code == '200') {
				uni.showToast({
					title: res.message,
					icon: 'success'
				});
				uni.switchTab({
					url:'../home/index'
				})
			}else {
			}
		}).catch(() => {
			uni.showToast({ title:'删除失败', icon:'error' })
		})
		popup_delete.value.close()
	}
	// 显示分享弹窗
	const showSharePopup = () => { popup_share.value.open(); flat.value = false }
	
	// 点击分享中的选项
	const select_share = (e:any) => {
		if(e.index == 1) {	// 复制链接
			uni.setClipboardData({
				// app.appContext.config.globalProperties.$url
				data: `https://cloud.ugee.com.cn/h5/index.html?notePageId=${option.notePageId}&notePageName=${encodeURIComponent(option.notePageName)}&notePageUuid=${option.notePageUuid}&type=1`,
				success: function() {
					uni.showToast({
						title: '复制成功',
						duration: 2000,
						icon: 'none'
					});
				},
				fail: function(err) {
					uni.showToast({
						title: '复制失败',
						duration: 2000,
						icon: 'none'
					});
				}
			});
		}else if(e.index == 0){ // 微信
			return {
			      title: option.notePageName,
			      path: `../../pages/pageSvg/index?notePageId=${option.notePageId}&notePageName=${option.notePageName}`,
			      imageUrl:''
			    };
		}
	}
	// 进度条播放
	const progressHandel = (e:any) => {
		console.log('aaaaaaaaaaaaaaaaaaaaa',e)
	}
	// 暂停播放
	const svgplay = () => {
		pgList.value = 0
		if(payimgsrc.value == '../../static/play.png') {
			payimgsrc.value = "../../static/start.png"
			loop(dataList.value.drawPaths[canvasNuM.value].paths,0,getColor(dataList.value.drawPaths[canvasNuM.value].color),dataList.value.drawPaths[canvasNuM.value].width,dataList.value.drawPaths[canvasNuM.value]?.maxPressure)
		} else {
			isSvgFlat.value = true
			payimgsrc.value = "../../static/play.png"
		}
	}
	// 播放
	const toplay = () => {
		if(isshowNoteImg.value == false) {
			isshowNoteImg.value = true
			// getCanvasData()
			// return
		}
		if(!dataList.value?.drawPaths) {
			uni.showToast({
				title:'暂无绘画内容',
				icon:'error'
			})
			return
		}
		if(payimgsrc.value == '../../static/play.png') {
			payimgsrc.value = "../../static/start.png"
			if(canvasNuM.value == 0) {
				pgList.value = 0
				proesss.value = 0
				ctx.clearRect(0,0,canvasWH.value.width,canvasWH.value.height)
				ctx.beginPath()
			}
			// playsvg.value == false ? 外层数据绘画完毕,外层下一项开始绘画 : 内层绘画未全部画完接上次继续画
			if(playsvg.value == false) {
				loop(dataList.value.drawPaths[canvasNuM.value].paths,0,getColor(dataList.value.drawPaths[canvasNuM.value].color),dataList.value.drawPaths[canvasNuM.value].width,dataList.value.drawPaths[canvasNuM.value]?.maxPressure)
			}else {
				loop(playsvg.value.animate,playsvg.value.i,playsvg.value.color,playsvg.value.lineWidth,dataList.value.drawPaths[canvasNuM.value]?.maxPressure)
			}
		} else {
			isSvgFlat.value = true
			payimgsrc.value = "../../static/play.png"
		}
	}
	// 绘画
	/* 
	 animate:坐标数组 , i: 数组当前索引 ,color:画笔颜色 ，lineWidth:画笔粗细 ，Pressure: 画笔压感 
	*/
	const loop = (animate: any, i: number,color:any,lineWidth:number,Pressure?:any) => {
			console.log('11',dataList.value.drawPaths[canvasNuM.value])
		  if(animate.length-1 == 0 ) {
			canvasNuM.value = canvasNuM.value +1;
			i = 0
			if(!dataList.value.drawPaths[canvasNuM.value] || dataList.value.drawPaths[canvasNuM.value].paths[0].s == 'hover' || dataList.value.drawPaths[canvasNuM.value].paths[0].s == 'leaves') { // 遍历结束
				pgList.value = 100
				payimgsrc.value = "../../static/play.png"
				canvasNuM.value = 0
				clearTimeout(timer.value)
				return
			}
			console.log('12',dataList.value.drawPaths[canvasNuM.value])
			loop(dataList.value.drawPaths[canvasNuM.value].paths,0,getColor(dataList.value.drawPaths[canvasNuM.value].color),dataList.value.drawPaths[canvasNuM.value].width,dataList.value.drawPaths[canvasNuM.value]?.maxPressure)
			return
		  }
		  console.log('13',dataList.value.drawPaths[canvasNuM.value])
		  if(i< animate.length-1) {
		    const arr = animate[i]
		    if(!arr) {
		      ctx.beginPath()
		    } else {
		      ctx.beginPath()
			  if(animate[i+1].s == 'hover' || animate[i+1].s == 'leaves') {
				ctx.beginPath()
			  }else{
				  ctx.setLineWidth(lineWidth)	// 笔的粗细
				  ctx.setStrokeStyle(rgbTo16(color))	// 颜色
				  ctx.setLineCap('round')
				  // ctx.globalAlpha= Pressure ? animate[i]?.p/Pressure : 1; //压感比例设置笔的颜色深浅
				  ctx.moveTo(animate[i].x*screenWH.wid, animate[i].y*screenWH.hig)
				  ctx.lineTo(animate[i+1].x*screenWH.wid, animate[i+1].y*screenWH.hig)
				  ctx.stroke()
				  ctx.draw(true)
			  }
			  // console.log(i,color,lineWidth)
			  progressValue.value = progressValue.value+1
			  proesss.value = proesss.value + 1
			  pgList.value =  (proesss.value/dataListLength.value)*100 // 进度条百分比
		    }
			  i++
		    timer.value = setTimeout(() => {
			  // 暂停播放
			  if(isSvgFlat.value) {
			  	if(i == animate.length-1) {
			  	  playsvg.value = false
			  	} else {
			  	  playsvg.value = {animate,i,color,lineWidth}
			  	}
			  	isSvgFlat.value = false
			  	return
			  }
		      loop(animate,i,color,lineWidth,Pressure)
			  console.log('animate.length-1',animate.length-1,dataListLength.value,dataList.value.drawPaths[canvasNuM.value])
		      if( i == animate.length-1) { // 一维数组当前的最后一项
			    console.log('animate.leng1111',animate.length-1,dataListLength.value,dataList.value.drawPaths[canvasNuM.value])
		        canvasNuM.value = canvasNuM.value +1;
				i = 0;
		        if(!dataList.value.drawPaths[canvasNuM.value]) { // 遍历结束
					console.log('animate.leng2222',animate.length-1,dataListLength.value,dataList.value.drawPaths[canvasNuM.value])
					pgList.value = 100
					payimgsrc.value = "../../static/play.png"
					canvasNuM.value = 0
					clearTimeout(timer.value)
		          return	
		        }else{
					console.log('animate.leng33333333333333',animate.length-1,dataListLength.value,dataList.value.drawPaths[canvasNuM.value])
					loop(dataList.value.drawPaths[canvasNuM.value].paths,0,getColor(dataList.value.drawPaths[canvasNuM.value].color),dataList.value.drawPaths[canvasNuM.value].width,dataList.value.drawPaths[canvasNuM.value]?.maxPressure)
				}
		      }
		    }, 10);
		  }
	}
	// 十进制颜色转十六进制颜色
	const getColor = (number:any) =>{
	  const alpha = number >> 24 & 0xff;
	  const red = number >> 16 & 0xff;
	  const green = number >> 8 & 0xff;
	  const blue = number & 0xff;
	  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
	}
	// 颜色rgb转16进制
	const rgbTo16 = (color:any) =>{
	    var values = color
	        .replace(/rgba?\(/, '')
	        .replace(/\)/, '')
	        .replace(/[\s+]/g, '')
	        .split(',')
	      var a = parseFloat(values[3] || 1),
	        r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255),
	        g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255),
	        b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255)
	      return '#' +
	        ('0' + r.toString(16)).slice(-2) +
	        ('0' + g.toString(16)).slice(-2) +
	        ('0' + b.toString(16)).slice(-2)
	}
</script>

<style scoped lang="scss">
	page{
		background: #f9f9f9;
	}
	.pageSvg_delete :deep(.uni-dialog-title-text){
		color: #000;
	}
	.pageSvg_delete :deep(.uni-dialog-button-group){
		background-color: #f5f5f5 !important;
		border-radius: 11px;
	}
	.pageSvg_delete :deep(.uni-dialog-button){
		color: #7a7a7a !important; 
	}
	.pageSvg_delete :deep(.uni-dialog-button-text){
		color: #7a7a7a !important; 
	}
	.pageSvg{
		box-sizing: border-box;
		font-family: PingFang SC;
		background: #FFFFFF;
		.noteImgs{
			width: 100%;
			// height: calc(100vh - 112rpx);
			image{
				width: 100%;
			}
		}
		.pageSvg_box{
			// background-color: #f5f5f5;
			// padding: 32rpx 32rpx 0;
			width: 100%;
			// height: calc(100vh - 88rpx);
			position: relative;
			.bgnotepage{
				position: absolute;
				width: 100%;
				height: calc(100vh - 112rpx);
				top: 0;
				left: 0;
			}
			.canvas{
				width: 100%;
				height: 100%;
			}
		}
		.pageSvg_play{
			background-color: #FFFFFF;
			// margin-bottom: 16rpx;
			padding: 20rpx 32rpx 0;
			position: absolute;
			bottom: 0;
			display: flex;
			width: 100%;
			height: 88rpx;
			box-shadow: 0px -16rpx 32rpx rgba(0,0,0,0.04);
			.pageSvg_play_img{
				image{
					width: 48rpx;
					height: 48rpx;
				}
			}
			.pageSvg_play_jd{
				flex: 1;
				margin-top: 20rpx;
				padding: 0 32rpx 0 16rpx;
			}
			.pageSvg_play_lue{
				position: relative;
				.pageSvg_play_share{
					position: absolute;
					right: 0;
					top: -274rpx;
					width: 184rpx;
					height: 254rpx;
					background: url('../../static/shart.png')no-repeat;
					background-size: 184rpx 254rpx;
					.pageSvg_share_box{
						padding:0 40rpx;
						.pageSvg_border-bottom{
							border-bottom: 1px solid #333333;
						}
						.pageSvg_share_content{
							display: flex;
							padding: 40rpx 0;
							font-size: 14px;
							font-weight: 400;
							color: #FFFFFF;
							image{
								margin-right: 8rpx;
								width: 40rpx;
								height: 40rpx;
							}
						}
					}
				}
				.lue{
					width: 48rpx;
					height: 48rpx;
				}
			}
		}
	}
</style>