import { theme } from 'antd'
import { Footer } from 'antd/es/layout/layout'


const AppFooter = () => {
  const { token: { colorBgContainer } } = theme.useToken()

  return (
    <Footer style={{ textAlign: 'center', background: colorBgContainer }}>
      Ant Design ©{new Date().getFullYear()} Created by devfulls
    </Footer>
  )
}

export default AppFooter
