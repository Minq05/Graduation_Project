import instance from '@/config/axios.customize'
import { IDiscounts } from '@/types/discounts'
import { DeleteFilled, EditFilled, FolderAddFilled } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Input, message, Popconfirm, Tooltip, Table, Tag, } from 'antd'
import debounce from 'debounce'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'


const Discounts = () => {
  const nav = useNavigate()
  const [data, setData] = useState<IDiscounts[]>([])
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState<IPagination>({ current: 1, pageSize: 10, total: 10 })
  const ListDiscounts = async (qs?: string) => {
    try {
      const url = `/api/v1/discounts?current=${pagination.current}&pageSize=${pagination.pageSize}${qs ? `&qs=${encodeURIComponent(qs)}` : ''}`
      const res = await instance.get(url)
      // console.log('Request URL:', url)
      const results = res?.data?.results || []
      setData(results)
      setPagination((prev) => ({
        ...prev,
        total: res?.data?.meta?.total || results.length
      }))
    } catch (error) {
      message.error('Không thể tải danh sách mã giảm giá ')
      setData([])
    }
  }
  const debounceSearch = useMemo(() =>
  debounce((text: string) => {
    setSearchText(text)
  },200 )
, [])

useEffect(() => {
  ListDiscounts(searchText)
}, [pagination.current, pagination.pageSize, searchText])

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await instance.delete(`/api/v1/discounts/${id}`)
      } catch (error: any) {
        console.log(error)
      }
    },
    onSuccess: (_, id) => {  
    const deletedCode = data.find(item => item._id === id)?.code || id
    message.success(`Xóa mã giảm giá ${deletedCode} thành công`)
    ListDiscounts()
  },
  })
  const handleDelete = (id:string) => {
    mutation.mutate(id)
  }
  
  const columns = [
  {
    title: 'Mã giảm giá',
    dataIndex: 'code',
    key: 'code',
    width: 150, 
  },
  {
    title: 'Giá trị giảm',
    dataIndex: 'value',
    key: 'value',
    width: 120,
  },
  {
    title: 'Giới hạn sử dụng',
    dataIndex: 'usage_limit',
    key: 'usage_limit',
    width: 140,
  },
  {
    title: 'Giới hạn mỗi người dùng',
    dataIndex: 'usage_per_user',
    key: 'usage_per_user',
    width: 160,
  },
   {
    title: 'Ngày bắt đầu',
    dataIndex: 'startDate',
    key: 'startDate',
    width: 180,
    render: (date: string | Date) => new Date(date).toLocaleString()
  },
  {
    title: 'Ngày kết thúc',
    dataIndex: 'endDate',
    key: 'endDate',
    width: 180,
    render: (date: string | Date) => new Date(date).toLocaleString()
  },
 {
  title: 'Trạng thái',
  dataIndex: 'status',
  key: 'status',
  width: 180,
  render: (_: string, record: IDiscounts) => {
    const now = new Date();
    const startDate = new Date(record.startDate);
    const endDate = new Date(record.endDate);

    let statusLabel = 'Sắp diễn ra';
    let color = 'blue';

    if (now < startDate) {
      statusLabel = 'Sắp diễn ra';
      color = 'blue';
    } else if (now > endDate) {
      statusLabel = 'Đã kết thúc';
      color = 'red';
    } else {
      statusLabel = 'Đang diễn ra';
      color = 'green';
    }

    return <Tag color={color}>{statusLabel}</Tag>;
  }
},
  {
    title: 'Thao tác',
    key: 'action',
    width: 150,
    render: (_: any, record: any) => (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Tooltip title="Chỉnh sửa">
          <Button type="primary" onClick={() =>nav(`/discounts/update/${record._id}`)}>
            <EditFilled />
          </Button>
        </Tooltip>
        <Popconfirm
          title="Xóa mã giảm giá"
          description="Bạn có chắc chắn muốn xóa mã giảm giá này?"
          okText="Đồng ý"
          cancelText="Không đồng ý"
          onConfirm={() => handleDelete(record._id)}
        >
          <Tooltip title="Xóa">
            <Button danger>
              <DeleteFilled />
            </Button>
          </Tooltip>
        </Popconfirm>
      </div>
    )
  }
]

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Quản lý mã giảm giá</h1>
          <p className='text-gray-500'>Quản lý mã giảm giá trong hệ thống</p>
          <Input.Search
          placeholder="Tìm kiếm mã giảm giá "
          allowClear
          enterButton
          defaultValue={searchText}
          onChange={(e) => debounceSearch(e.target.value)}
          onSearch={(value) => setSearchText(value)}  
          style={{ width: 300 }}
          />
        </div>
        <div style={{}} >
          <Button type='primary' onClick={()=>nav('/discounts/add')}>
            <FolderAddFilled /> Thêm mã giảm giá
          </Button>
        </div>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={(data) => data._id}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize
            }))
          }
        }}
/>
    </div>
  )
}

export default Discounts
