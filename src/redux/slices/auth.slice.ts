import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IUserAuth {
  _id: string
  email: string
  fullName?: string
  name?: string
  phone?: string
  avatar?: string
  role?: string
}

interface IState {
  isSignin: boolean
  access_token: string | null
  user: IUserAuth | null
  isRefreshToken: boolean
  isLoading: boolean
  errorRefreshToken: string | null
}

interface ISigninAuth {
  user: IUserAuth
  access_token: string
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
    setSignout: (state) => {
      state.isSignin = false
      state.access_token = null
      state.user = null
      state.isRefreshToken = false
      state.isLoading = false
      state.errorRefreshToken = null
    }
  }
})

export const { setStateSignin, setAccessToken, setRefreshToken, setSignout } = authSlice.actions

export default authSlice.reducer
