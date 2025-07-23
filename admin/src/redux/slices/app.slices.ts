import { createSlice } from '@reduxjs/toolkit'

interface IState {
  isOpenDrawer: boolean
  isDarkMode: boolean
  themeMode: string
}

const initialState: IState = {
  isOpenDrawer: true,
  isDarkMode: false,
  themeMode: 'light'
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setStateDrawer: (state) => {
      state.isOpenDrawer = !state.isOpenDrawer
    },
    setIsDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode
    },
    setStateThemeMode: (state, payload) => {
      state.themeMode = payload.payload
    }
  }
})

export const { setStateDrawer, setIsDarkMode, setStateThemeMode } = appSlice.actions

export default appSlice.reducer
