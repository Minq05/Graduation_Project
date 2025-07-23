import { createSlice } from '@reduxjs/toolkit'

interface IState {
  isOpenDrawer: boolean
}

const initialState: IState = {
  isOpenDrawer: true
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setStateDrawer: (state) => {
      state.isOpenDrawer = !state.isOpenDrawer
    }
  }
})

export const { setStateDrawer } = appSlice.actions

export default appSlice.reducer
