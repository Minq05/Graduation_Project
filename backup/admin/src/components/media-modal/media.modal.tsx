import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { CheckCircleFilled, CloseOutlined } from '@ant-design/icons'
import { Modal, Tabs, TabsProps, Checkbox } from 'antd'
import UploadMedia from './upload.media'
import { useQuery } from '@tanstack/react-query'
import { fetchListMediaAPI } from '@/services/media-service/media.apis'
import { setIsOpenModalUpload, setSelectedMedia, setArrSelectedMedia } from '@/redux/slices/media.slice'
import { MEDIA_QUERY_KEYS } from '@/services/media-service/media.keys'
import { useState } from 'react'

interface MediaModalProps {
  multiSelect?: boolean;
}

const MediaModal = ({ multiSelect = false }: MediaModalProps) => {
  const dispatch = useAppDispatch()
  const isOpenModalUpload = useAppSelector((state) => state.media.isOpenModalUpload)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [mainImage, setMainImage] = useState<string>('')

  const { data: listMedia } = useQuery({
    queryKey: [MEDIA_QUERY_KEYS.FETCH_ALL],
    queryFn: async () => {
      const res = await fetchListMediaAPI()
      if (res && res.data) {
        return res.data
      } else {
        throw new Error('Failed to fetch media data')
      }
    }
  })

  const onChangeTabs = (key: string) => {
    // eslint-disable-next-line no-console
    console.log(key)
  }

  const handleSelectImage = (image: string) => {
    if (!multiSelect) {
      dispatch(setSelectedMedia(image))
      dispatch(setIsOpenModalUpload(false))
      return
    }
    
    // Xử lý chọn nhiều ảnh
    if (selectedImages.includes(image)) {
      // Nếu ảnh đã được chọn, bỏ chọn
      setSelectedImages(selectedImages.filter(img => img !== image))
      // Nếu ảnh đang bỏ chọn là ảnh chính, xóa ảnh chính
      if (mainImage === image) {
        setMainImage('')
      }
    } else {
      // Nếu ảnh chưa được chọn, thêm vào danh sách
      setSelectedImages([...selectedImages, image])
      // Nếu chưa có ảnh chính, đặt ảnh này làm ảnh chính
      if (!mainImage) {
        setMainImage(image)
      }
    }
  }
  
  const handleSetMainImage = (image: string) => {
    setMainImage(image)
  }
  
  const handleSaveImages = () => {
    if (multiSelect) {
      // Kiểm tra nếu có ít nhất một ảnh được chọn
      if (selectedImages.length > 0) {
        // Đảm bảo có ảnh chính, nếu không thì lấy ảnh đầu tiên
        const mainImg = mainImage || selectedImages[0];
        // Đảm bảo ảnh chính luôn ở vị trí đầu tiên
        const sortedImages = [mainImg, ...selectedImages.filter(img => img !== mainImg)]
        dispatch(setArrSelectedMedia(sortedImages))
        dispatch(setSelectedMedia(mainImg)) // Vẫn lưu ảnh chính vào selectedMedia
      } else {
        // Nếu không có ảnh nào được chọn, hiển thị thông báo
        alert('Vui lòng chọn ít nhất một ảnh cho album')
        return;
      }
    }
    dispatch(setIsOpenModalUpload(false))
  }

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Tải lên tệp mới',
      children: (
        <div className="" style={{ height: '500px' }}>
          <UploadMedia />
        </div>
      )
    },
    {
      key: '2',
      label: 'Chọn từ thư viện Media',
      children: (
        <div className='grid grid-cols-8 bg-white rounded-lg gap-4'>
          {
            listMedia && listMedia.results.length > 0 && listMedia.results?.map((media: IMedia) => {
              const isSelected = selectedImages.includes(media?.filePath || '');
              const isMainImage = mainImage === media?.filePath;
              return (
                <div key={media?._id} className="relative">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${media?.filePath}`}
                    alt={media?.filename}
                    className={`object-cover rounded cursor-pointer ${isSelected ? 'border-2 border-blue-500' : ''}`}
                    onClick={() => handleSelectImage(media?.filePath || '/placeholder.svg')}
                    crossOrigin="anonymous"
                  />
                  {multiSelect && isSelected && (
                    <div className="absolute top-0 right-0 p-1">
                      <Checkbox 
                        checked={isMainImage}
                        onChange={() => handleSetMainImage(media?.filePath || '')}
                      >
                        Ảnh chính
                      </Checkbox>
                    </div>
                  )}
                  {multiSelect && isSelected && (
                    <div className="absolute top-0 left-0 p-1">
                      <CheckCircleFilled className="text-blue-500 text-xl" />
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      )
    }
  ]

  return (
    <Modal
      open={isOpenModalUpload}
      onOk={() => dispatch(setIsOpenModalUpload(false))}
      onCancel={() => dispatch(setIsOpenModalUpload(false))}
      width='90%'
      height={'80vh'}
      centered
      title="Media Library"
      className='media-modal'
      closeIcon={<CloseOutlined className='text-white text-xl' />}
      footer={
        <div className="flex justify-end space-x-2">
          <button 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => dispatch(setIsOpenModalUpload(false))}
          >
            Hủy
          </button>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSaveImages}
          >
            {multiSelect ? 'Lưu album ảnh' : 'Chọn ảnh'}
          </button>
        </div>
      }
      styles={{
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)'
        },
        content: {
          backgroundColor: 'white',
          boxShadow: 'none',
          padding: '16px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }
      }}
      style={{ zIndex: 1000 }}
    >
      <Tabs defaultActiveKey="1" items={items} onChange={onChangeTabs} />
    </Modal>
  )
}

export default MediaModal
