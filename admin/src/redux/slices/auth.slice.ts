import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IState {
  isSignin: boolean
  access_token: string | null
  user: IUserAuth | null
  isRefreshToken: boolean
  isLoading: boolean
  errorRefreshToken: string | null
}

interface ISigninAuth {
  user: IUserAuth | null
  access_token: string | null
}

const initialState: IState = {
  isSignin: false,
  access_token: null,
  user: null,
  isRefreshToken: false,
  isLoading: false,
  errorRefreshToken: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setStateSignin: (state, action: PayloadAction<ISigninAuth>) => {
      const { user, access_token } = action.payload
      state.isSignin = true
      state.user = user
      state.access_token = access_token
    },
    setAccessToken: (state, action: PayloadAction<{ access_token: string }>) => {
      state.access_token = action.payload?.access_token ?? null
    },
    setRefreshToken: (state, action: PayloadAction<{ status: boolean, message: string }>) => {
      state.isRefreshToken = action.payload?.status ?? false
      state.errorRefreshToken = action.payload?.message ?? ''
    },

    setStateSignout: (state) => {
      state.isSignin = false
      state.user = null
      state.access_token = null
    }
  }
})

export const { setStateSignin, setAccessToken, setRefreshToken, setStateSignout } = authSlice.actions

export default authSlice.reducer
