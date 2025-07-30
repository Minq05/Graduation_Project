import { Layout, theme } from 'antd'
import AppFooter from '@/components/app/app.footer'
import AppHeader from '@/components/app/app.header'
import AppSidebar from '@/components/app/app.sidebar'
import { Outlet } from 'react-router'
import AppBreadcrumb from '@/components/app/app.breadcrumb'

const { Content } = Layout

const LayoutPage = () => {
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar />

      <Layout>
        <AppHeader />

        <Content style={{ margin: '0 16px' }}>
          <AppBreadcrumb />
          <div
            style={{
              padding: 24,
              minHeight: 700,
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}
          >
            <Outlet />
          </div>
        </Content>

        <AppFooter />
      </Layout>
    </Layout>
  )
}

export default LayoutPage
