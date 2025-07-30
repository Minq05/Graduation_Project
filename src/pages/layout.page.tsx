import AppFooter from '@/components/app/app.footer'
import AppHeader from '@/components/app/app.header'
import { Outlet } from 'react-router'


const LayoutPage = () => {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <AppHeader />
      <div className="w-full">
        <Outlet />
      </div>
      <AppFooter />
    </div>
  )
}

export default LayoutPage
