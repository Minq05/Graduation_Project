import { uploadMediaAPI } from '@/services/media-service/media.apis'
import { MEDIA_QUERY_KEYS } from '@/services/media-service/media.keys'
import { InboxOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { message, Upload, UploadProps } from 'antd'

const { Dragger } = Upload

const UploadMedia = () => {
  const queryClient = useQueryClient()

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await uploadMediaAPI(formData)

        onSuccess?.(response.message, file)
        queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.FETCH_ALL] })
      } catch (error) {
        onError?.(error as Error)
      }
    },
    onChange(info) {
      const { status } = info.file
      if (status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`)
        // Lấy URL ảnh từ response
        console.log('Uploaded URL:', info.file.response?.secure_url)
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    }
  }

  return (
    <Dragger {...props}>
      <p className='ant-upload-drag-icon'>
        <InboxOutlined />
      </p>
      <p className='ant-upload-text'>Chọn hoặc kéo thả file vào khu vữc tải file</p>
      <p className='ant-upload-hint'>
        Support for a single or bulk upload. Strictly prohibited from uploading company data or other
        banned files.
      </p>
    </Dragger>
  )
}

export default UploadMedia
