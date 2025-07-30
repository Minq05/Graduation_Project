// import { useAppSelector } from '@/redux/hooks'
import { Navigate, Outlet } from 'react-router'

interface IProps {
  isAllowed: boolean
  redirectTo: string
  children?: React.ReactNode
}

const PrivateRouters = ({ isAllowed, redirectTo = '/', children }: IProps) => {
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />
  }
  return children ? children : <Outlet />
}

export default PrivateRouters
