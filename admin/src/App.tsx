import { ConfigProvider, theme as antTheme } from 'antd'
import Routers from './routers/routers'
import { useAppDispatch, useAppSelector } from './redux/hooks'
import { lazy, Suspense, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { fetchAccountAPI } from './services/user-service/user.apis'

const MediaModal = lazy(() => import('./components/media-modal/media.modal'))


const App = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const themeMode = useAppSelector(state => state.app.themeMode)
  // Lấy giá trị multiSelect từ Redux store
  const multiSelect = useAppSelector(state => state.media.isMultiSelect)
  
  useEffect(() => {
    (async () => {
      try {
        await fetchAccountAPI()
      } catch (error) {
        console.error('Error fetching account data:', error)
        navigate('/signin')
      }
    })()
  }, [navigate])

  return (
    <div>
      <ConfigProvider theme={{ algorithm: themeMode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm }}>
        <Routers />
        <Suspense fallback={<div>Đang tải...</div>}>
          <MediaModal multiSelect={multiSelect} />
        </Suspense>
      </ConfigProvider>
    </div>
  )
}

export default App
