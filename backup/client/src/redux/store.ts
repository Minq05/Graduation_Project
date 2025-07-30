import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import appReducer from './slices/app.slices'
import authReducer from './slices/auth.slice'
import cartReducer from './slices/cart.slice'

// Config redux-persist
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'app', 'cart']
}

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  cart: cartReducer
})

// Create persist reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false // Disable sequential checks to avoid errors with redux-persist
    })
})

// Create persistor to enable storage
export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
