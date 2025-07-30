import { Col, Form, Modal, Row, Select } from 'antd'
const { Option } = Select

interface IProps {
  isModalVisible: boolean
  handleModalOk: () => void
  setIsModalVisible: (visible: boolean) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

const UpdateModal = (props: IProps) => {
  const { isModalVisible, handleModalOk, setIsModalVisible, form } = props

  return (
    <Modal
      title={'Chỉnh sửa người dùng'}
      open={isModalVisible}
      onOk={handleModalOk}
      onCancel={() => setIsModalVisible(false)}
      width={600}
      okText={'Cập nhật'}
      cancelText='Hủy'
    >
      <Form form={form} layout='vertical' className='mt-4'>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='role' label='Vai trò' rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
              <Select placeholder='Chọn vai trò'>
                <Option value='admin'>Quản trị viên</Option>
                <Option value='moderator'>Điều hành viên</Option>
                <Option value='user'>Người dùng</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='status'
              label='Trạng thái'
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select placeholder='Chọn trạng thái'>
                <Option value='active'>Hoạt động</Option>
                <Option value='inactive'>Không hoạt động</Option>
                <Option value='banned'>Bị cấm</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default UpdateModal
