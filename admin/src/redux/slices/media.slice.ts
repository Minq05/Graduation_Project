import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IState {
  selectedMedia: string | null
  isOpenModalUpload: boolean
  arrSelectedMedia?: string[] | null
  isMultiSelect: boolean
}

const initialState: IState = {
  selectedMedia: null,
  isOpenModalUpload: false,
  arrSelectedMedia: null,
  isMultiSelect: false
}

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setSelectedMedia: (state, action) => {
      state.selectedMedia = action.payload
    },
    clearSelectedMedia: (state) => {
      state.selectedMedia = null
    },
    setIsOpenModalUpload: (state, action: PayloadAction<boolean>) => {
      state.isOpenModalUpload = action.payload
    },
    setArrSelectedMedia: (state, action: PayloadAction<string[] | null>) => {
      state.arrSelectedMedia = action.payload
    },
    clearArrSelectedMedia: (state) => {
      state.arrSelectedMedia = null
    },
    setIsMultiSelect: (state, action: PayloadAction<boolean>) => {
      state.isMultiSelect = action.payload
    }
  }
})

export const {
  setSelectedMedia,
  clearSelectedMedia,
  setIsOpenModalUpload,
  setArrSelectedMedia,
  clearArrSelectedMedia,
  setIsMultiSelect
} = mediaSlice.actions

export default mediaSlice.reducer
