import { defineStore } from 'pinia'
const useStore = defineStore('storeId', {
  // arrow function recommended for full type inference
  state: () => ({
    // all these properties will have their type inferred automatically
    count: 0,
	notefreshToken:uni.getStorageSync('notefreshToken') || '',
	notetoken:uni.getStorageSync('notetoken') || '',
	userInfo:uni.getStorageSync('noteUserInfo') || ''
  }),
  getters: {
    isEven: (state) => state.count % 2 === 0
  },
  actions: {
    synIncrease() {
      this.count += 1
    },
	getUserInfo(userInfo:any) {
		this.userInfo = userInfo
	},
	getToken(notetoken:string) {
		this.notetoken = notetoken
	},
	getFreshToken(notefreshToken:string) {
		this.notefreshToken = notefreshToken
	},
    async asyncIncrease() {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      this.count += 1
    }
  }
})

export default useStore
