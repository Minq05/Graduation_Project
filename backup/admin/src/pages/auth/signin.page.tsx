import { Form, Input, Button, Divider, message } from "antd"
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons"
import { useMutation } from "@tanstack/react-query"
import { useAppDispatch } from "@/redux/hooks"
import { useNavigate } from "react-router"
import { signinAPI } from "@/services/auth-service/auth.apis"
import { setAccessToken, setStateSignin } from "@/redux/slices/auth.slice"

const SigninPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const signinMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const res = await signinAPI(values)
      if (res.data) {
        return res.data
      } else {
        throw new Error('Đăng nhập không thành công. Vui lòng thử lại.')
      }
    },
    onSuccess: (data: IAuth) => {
      dispatch(setStateSignin({ user: data.user, access_token: data.access_token }))
      dispatch(setAccessToken({ access_token: data.access_token }))
      message.success('Đăng nhập thành công!')
      // navigate('/')
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.log('🚀 ~ SigninPage ~ error:', error)
      message.error('Đăng nhập không thành công. Vui lòng thử lại.')
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (values: any) => {
    console.log('🚀 ~ onFinish ~ values:', values)
    const { email, password } = values
    signinMutation.mutate({ email, password })
  }

  const handleGoogleSignIn = () => {
    // Simulate Google sign-in
    setTimeout(() => {
      message.success("Logged in with Google!")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <div className="flex justify-center">
            <img className="h-12 w-auto" src="/placeholder.svg?height=48&width=48" alt="Logo" crossOrigin="anonymous" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Đăng nhập</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{" "}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              tạo tài khoản mới
            </a>
          </p>
        </div>

        <Form
          name="signin"
          className="mt-8 space-y-6"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Email address"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Please input your password!" }]}>
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <div className="flex items-center justify-between">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <a className="text-sm font-medium text-blue-600 hover:text-blue-500" href="#">
                Quên mật khẩu?
              </a>
            </Form.Item>
          </div>

          <div>
            <Button
              type="primary"
              htmlType="submit"
              loading={signinMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-md py-2 h-auto"
              size="large"
            >
              Đăng nhập
            </Button>
          </div>

          <Divider plain>Hoặc tiếp tục với</Divider>

          <div>
            <Button
              icon={<GoogleOutlined />}
              size="large"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center border-gray-300 rounded-md py-2 h-auto"
            >
              Đăng nhập với Google
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default SigninPage
