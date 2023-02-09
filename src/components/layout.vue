<script lang="ts" name="ChildView" setup>
import { onMounted, ref,watch,toRefs } from 'vue';
import { userApi } from '@/api'
import { user } from '@/store'
let popup  = ref()
let rePassWord  = ref()
const store = user()
const props = defineProps<{
  homeData: any;
}>();
const { homeData} = toRefs(props)
watch(() => homeData.value, (newValue, oldValue) => {
	console.log('===',homeData.value,newValue, oldValue)
	console.log(`子组件接收父组件传入的数据`, props.homeData)
    homeData.value
},{
	deep:true
})

const emit = defineEmits(["toPage"])
const toPage = (fileId:string,tagName:string) => {
	console.log(fileId,tagName)
  uni.navigateTo({
  	url:`../../pages/pageSvg/index?fileId=${fileId}&tagName=${tagName}`
  })
}
const toPageBook = (noteBookId:string,tagName:string) => {
  uni.navigateTo({
  	url:`../../pages/pageBook/index?noteBookId=${noteBookId}&tagName=${tagName}`
  })
}
// 点击阅读密码
const readPassWord = () => {
	popup.value.open()
}
// 关闭弹窗
const close = () => {
	popup.value.close()
}
// 确认弹窗
const confirm = () => {
	userApi.verificationReadPassword(store.$state.userInfo.id,rePassWord.value)
	.then((res2) => {
		console.log('e333',res2)
		if(res2.code == '200') {
			
		}else {
					
		}
	})
	popup.value.close()
}
</script>

<template>
	<view>
		<view class="home_content">
			<view class="home_content_box" v-for="item in homeData" :key="item">
				<view class="date">{{item.date}}</view>
				<!-- 笔记本 -->
				<template v-if="item.notesBookPojoList">
					<view class="data" v-for="item2 in item.notesBookPojoList" :key="item2.id">
						<view class="data_content">
							<view class="linex"></view>
							<view class="data_left" @click="toPageBook(item2.id,item2.noteBookName)">
								<image class="data_img" :src="item2.backgroundPath" mode=""></image>
							</view>
							<view class="data_right">
								<view class="data_right_text" @click="toPageBook(item2.id,item2.noteBookName)">
									<view class="title">{{item2.noteBookName}}</view>
									<view class="titledate">{{item2.createTime}}</view>
								</view>
								<view class="data_right_suo" @click="readPassWord">
									<image v-if="item2.isEncryption==1" src="../static/suo.png" mode=""></image>
								</view>
							</view>
						</view>
					</view>
						
				</template>
				<!-- 笔记页 -->
				<template  v-if="item.notePagePojoList">
					<view class="data" v-for="item2 in item.notePagePojoList" :key="item2.id">
						<view class="data_content">
							<view class="linex linexpage" style="background-color: #69bbc0;"></view>
							<view class="data_left" @click="toPage(item2.id,item2.notePageName)">
								<image class="data_img" :src="item2.notePageRelatePath.remoteImgPath" mode=""></image>
							</view>
							<view class="data_right">
								<view class="data_right_text" @click="toPage(item2.id,item2.notePageName)">
									<view class="title">{{item2.notePageName}}</view>
									<view class="titledate">{{item2.createTime}}</view>
								</view>
								<view class="data_right_suo" @click="readPassWord">
									<image v-if="item2.isEncryption==1" src="../static/suo.png" mode=""></image>
								</view>
							</view>
						</view>
					</view>
				</template>
			</view>
		</view>
		<view class="home_popup">
			<uni-popup ref="popup" type="dialog">
				<uni-popup-dialog title="请输入阅读密码" confirmText="打开" message="成功消息" :duration="2000" :before-close="true" @close="close" @confirm="confirm">
					<input placeholder="请输入阅读密码查看" v-model.trim="rePassWord" class="home_popup_input" type="password">
				</uni-popup-dialog>
			</uni-popup>
		</view>
	</view>
</template>
<style scoped lang="scss">
	.home_popup :deep(.uni-dialog-title-text){
		color: #000;
	}
	.home_popup :deep(.uni-dialog-button-group){
		background-color: #f5f5f5 !important;
	}
	.home_popup :deep(.uni-border-left){
		color: #fff;
		background-color: #0063ff !important;
	}
	.home_popup :deep(.uni-button-color){
		color: #fff;
	}
	.home_popup {
		.home_popup_input{
			width: 100vh;
			height: 44px;
			background: rgba(0,0,0,0.04);
			border: 1px solid rgba(0,0,0,0.2039);
			border-radius: 4px;
			font-size: 14px;
			font-family: HYQiHei;
			color: #000000;
			padding-left: 45px;
		}
	}
	.search{
		margin: 40rpx 32rpx;
		display: flex;
		height: 88rpx;
		line-height: 88rpx;
		background: #F5F7FA;
		opacity: 1;
		border-radius: 46rpx;
		color: #b8b9bb;
		.search_icon{
			padding-left: 48rpx;
			padding-right: 16rpx;
		}
	}
	.uni-searchbar{
		padding: 0;
	}
	.uni-searchbar__box{justify-content: left;}
	.home_emty{
		margin-top: 60rpx;
		text-align: center;
		image{
			width: 380rpx;
			height: 380rpx;
		}
		view{
			margin-top: 32rpx;
			font-size: 14px;
			font-family: PingFang SC;
			font-weight: 400;
			color: #000000;
			opacity: 0.4;
		}
	}
	.home_content{
		padding: 0 32rpx;
		.home_content_box{
			margin-top: 48rpx;
			.date{
				font-size: 11px;
				font-family: HYQiHei;
				color: #000000;
				opacity: 0.4;
				margin-bottom: 20rpx;
			}
			.data{
				.data_content{
					height: 176rpx;
					background: #F5F7FA;
					opacity: 1;
					border-radius: 16rpx;
					padding: 24rpx 20rpx;
					display: flex;
					margin-bottom: 16rpx;
					position: relative;
					.linex{
						width: 3px;
						height: 20px;
						background-color: #f451b2;
						left: 0;
						position: absolute;
					}
					.data_left{
						margin-right: 16rpx;
						.data_img{
							width: 88rpx;
							height: 120rpx;
							border-radius: 2px;
						}
					}
					.data_right{
						display: flex;
						justify-content: space-between;
						flex: 1;
						.data_right_text{
							font-size: 16px;
							font-family: HYQiHei;
							font-weight: normal;
							color: #000000;
							width: 100%;
							.titledate{
								margin-top: 16rpx;
								font-size: 11px;
								opacity: 0.4;
							}
						}
						.data_right_suo{
							image{
								width: 48rpx;
								height: 48rpx;
							}
						}
					}
				}
			}
		}
	}
</style>
