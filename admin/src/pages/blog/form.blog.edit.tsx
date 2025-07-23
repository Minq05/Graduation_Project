import { Form, Input, Typography, Button, Switch, Select, message } from 'antd'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/config/axios.customize'
import { useNavigate, useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { UploadOutlined } from '@ant-design/icons'
import { setIsOpenModalUpload } from '@/redux/slices/media.slice'

const { Title } = Typography

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean']
  ]
}

interface IBlog {
  title: string
  slug: string
  content: string
  isPublic: boolean
  categoryBlogId?: string
}

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const FormBlogEdit = () => {
  const [form] = Form.useForm()
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
  const [isSlugTouched, setIsSlugTouched] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const mediaUrl = useAppSelector((state) => state.media.selectedMedia)

  const titleValue = Form.useWatch('title', form)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/v1/cateblog')
        setCategories(res.data.results || [])
      } catch (error) {
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  const { data: blogData } = useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/blogs/${id}`)
      return res.data
    },
    enabled: !!id
  })

  useEffect(() => {
    if (blogData) {
      console.log('blogData:', blogData) // Để debug
      form.setFieldsValue({
        title: blogData.title,
        slug: blogData.slug,
        categoryBlogId: blogData.categoryBlogId,
        content: blogData.content,
        isPublic: blogData.isPublic,
        image: blogData.image
      })
      setContent(blogData.content || '')
      setImageUrl(blogData.image || '')
      setIsSlugTouched(false)
    }
  }, [blogData, form])

  useEffect(() => {
    if (!isSlugTouched) {
      form.setFieldsValue({ slug: toSlug(titleValue || '') })
    }
  }, [titleValue, isSlugTouched, form])

  const editBlogMutation = useMutation({
    mutationFn: async (values: IBlog) => {
      const { data } = await axios.patch(`/api/v1/blogs/${id}`, {
        ...values,
        content
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      message.success('Cập nhật bài viết thành công')
      navigate('/blogs')
    }
  })

  useEffect(() => {
    console.log('mediaUrl ban đầu:', mediaUrl)
    if (mediaUrl) {
      const fullImageUrl = mediaUrl.startsWith('http') ? mediaUrl : `http://localhost:8080${mediaUrl}`
      console.log('Đường dẫn hình ảnh đầy đủ:', fullImageUrl)
      
      form.setFieldsValue({ image: fullImageUrl })
      setImageUrl(fullImageUrl)
      console.log('Đã gán đường dẫn vào form:', form.getFieldValue('image'))
    }
  }, [mediaUrl, form])

  const onFinish = async (values: IBlog) => {
    if (!content || content === '<p><br></p>') {
      return
    }
    editBlogMutation.mutate({ ...values, content })
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Chỉnh sửa bài viết</Title>
      <Form
        layout='vertical'
        form={form}
        onFinish={onFinish}
        style={{ maxWidth: 800, margin: '0 auto' }}
        initialValues={{ isPublic: true }}
      >
        <Form.Item
          label='Tiêu đề'
          name='title'
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input
            placeholder='Nhập tiêu đề'
            onChange={() => setIsSlugTouched(false)}
          />
        </Form.Item>

        <Form.Item
          label='Slug'
          name='slug'
          rules={[{ required: true, message: 'Vui lòng nhập Slug' }]}
        >
          <Input
            placeholder='Slug' disabled
            onChange={() => setIsSlugTouched(true)}
          />
        </Form.Item>

        <Form.Item
          label='Danh mục'
          name='categoryBlogId'
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        >
          <Select
            placeholder='Chọn danh mục'
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat._id
            }))}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label='Nội dung'
          name='content'
          required
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <ReactQuill
            theme='snow'
            value={content}
            onChange={setContent}
            modules={modules}
            style={{ minHeight: 200, borderRadius: 6, height: 180, marginBottom: 50 }}
          />
        </Form.Item>

        <Form.Item
          label="Hình ảnh (URL)"
          name="image"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Input placeholder="Đường dẫn ảnh sẽ tự động điền sau khi tải lên" disabled value={form.getFieldValue('image') || ''} />
            {imageUrl && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={imageUrl} 
                  alt="Hình ảnh bài viết" 
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid #f0f0f0', padding: '5px' }} 
                />
              </div>
            )}
            <div style={{ marginTop: '10px' }}>
              <Button icon={<UploadOutlined />} onClick={() => dispatch(setIsOpenModalUpload(true))}>
                {imageUrl ? 'Thay đổi ảnh' : 'Tải ảnh lên'}
              </Button>
            </div>
          </div>
        </Form.Item>

        <Form.Item
          label='Hiển thị công khai'
          name='isPublic'
          valuePropName='checked'
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            style={{ marginTop: 16 }}
            loading={editBlogMutation.isPending}
          >
            Cập nhật bài viết
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default FormBlogEdit
