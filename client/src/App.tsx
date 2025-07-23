import Routers from './routers/routers'
import { fetchAccountAPI } from './services/user-service/user.apis'
import { useNavigate } from 'react-router'
import { useEffect } from 'react'
import ScrollToTop from './components/scroll-to-top'


const App = () => {
  const navigate = useNavigate()
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
      <ScrollToTop />
      <Routers />
    </div>
  )
}

export default App
