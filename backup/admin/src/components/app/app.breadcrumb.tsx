import { Breadcrumb } from 'antd'
import { Link } from 'react-router'

const AppBreadcrumb = () => {

  return (
    <Breadcrumb
      style={{ margin:'16px 0' }}
      items={[
        {
          title: 'Home'
        },
        {
          title: <Link to="">Application Center</Link>
        }
      ]}
    />
  )
}

export default AppBreadcrumb
