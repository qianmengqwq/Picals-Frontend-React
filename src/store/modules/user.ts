import { createSlice } from '@reduxjs/toolkit'
import type { UserInfo } from '@/utils/types'
import { LabelItem } from '@/apis/types'

const userStore = createSlice({
  name: 'user',
  initialState: {
    userInfo: {
      id: '',
      username: '',
      avatar: '',
      intro: '',
      email: '',
      fanNum: 0,
      followNum: 0,
    } as UserInfo,
    likedLabels: [] as LabelItem[],
    isLogin: false,
  },
  reducers: {
    setUserInfo(state, action) {
      state.userInfo = action.payload
    },
    setLikedLabels(state, action) {
      state.likedLabels = action.payload
    },
    setLoginStatus(state, action) {
      state.isLogin = action.payload
    },
    logout(state) {
      state.userInfo = {
        id: '',
        username: '',
        avatar: '',
        intro: '',
        email: '',
        fanNum: 0,
        followNum: 0,
      }
      state.likedLabels = []
      state.isLogin = false
    },
  },
})

const { setUserInfo, setLikedLabels, setLoginStatus, logout } = userStore.actions

const userReducer = userStore.reducer

// 导出
export { setUserInfo, setLikedLabels, setLoginStatus, logout }
export default userReducer
