import { useState } from 'react'
import { Layout, Button, Modal, Dropdown, Pagination, Tooltip, message } from 'antd'
import {
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined,
  PlayCircleOutlined,
  FileImageOutlined,
  FileOutlined,
  UploadOutlined,
  CopyOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { useAppDispatch } from '@/redux/hooks'
import UploadMedia from '@/components/media-modal/upload.media'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { convertTimeVietnam } from '@/utils/utils'
import { deleteMediaAPI, fetchListMediaAPI } from '@/services/media-service/media.apis'
import { setIsOpenModalUpload } from '@/redux/slices/media.slice'
import { MEDIA_QUERY_KEYS } from '@/services/media-service/media.keys'

const { Content, Footer } = Layout

export interface Media {
  id: number
  title: string
  type: string
  thumbnail: string
  description: string
  date: string
  tags: string[]
}

const MediaPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedMedia, setSelectedMedia] = useState<IMedia | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [mediaType, setMediaType] = useState<string>('all')
  const [showDragger, setShowDragger] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [isCopy, setIsCopy] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  const { data: listMedia, isLoading } = useQuery({
    queryKey: [MEDIA_QUERY_KEYS.FETCH_ALL, page],
    queryFn: async () => {
      const res = await fetchListMediaAPI()
      if (res && res.data) {
        return res.data.results
      } else {
        throw new Error('Failed to fetch media data')
      }
    },
    refetchOnWindowFocus: false,
  })

  const deleteImageMutation = useMutation({
    mutationFn: async ({ _id, filename }: { _id: string; filename: string }) => {
      const res = await deleteMediaAPI(_id, filename)
      if (res && res.data) {
        return res.data
      } else {
        throw new Error('Xoá không thành công')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEYS.FETCH_ALL] })
      message.success('Xóa thành công')
    }
  })

  const filteredMedia = mediaType === 'all' ? listMedia : listMedia?.filter((item: IMedia) => item?.fileType === mediaType)

  const handleMediaClick = (media: IMedia) => {
    setSelectedMedia(media)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedMedia(null)
  }

  const handleDeleteMedia = (publicId: string, filename: string) => {
    deleteImageMutation.mutate({ _id: publicId, filename })
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setIsCopy(true)
  }


  const menu = {
    onClick: ({ key }: { key: string } ) => setMediaType(key),
    selectedKeys: [mediaType],
    items: [
      { key: 'all', label: 'Tất cả' },
      { key: 'image', label: 'Hình ảnh', icon: <FileImageOutlined /> },
      { key: 'video', label: 'Video', icon: <PlayCircleOutlined /> },
      { key: 'audio', label: 'Âm thanh', icon: <FileOutlined /> }
    ]
  }

  return (
    <Layout className='min-h-screen' style={{ backgroundColor: 'transparent' }}>
      <div className='flex items-center justify-between py-3 mb-5' >
        <div className='text-xl font-bold'>Thư viện ảnh</div>
        <div className='flex items-center gap-4'>
          <Dropdown menu={menu} trigger={['click']}>
            <Button icon={<FilterOutlined />}>Lọc</Button>
          </Dropdown>
          <Button
            icon={viewMode === 'grid' ? <BarsOutlined /> : <AppstoreOutlined />}
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? 'Danh sách' : 'Dạng lưới'}
          </Button>

          <Button icon={<UploadOutlined />} onClick={() => dispatch(setIsOpenModalUpload(true))}>
            Tải lên
          </Button>

          <Button icon={<UploadOutlined />} onClick={() => setShowDragger(!showDragger)}>
            Tải ảnh lên
          </Button>
        </div>
      </div>

      {
        showDragger && (
          <div className='mb-4'>
            <UploadMedia/>
          </div>
        )
      }

      <Content>
        <div
          className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6' : 'space-y-4'}`}
        >
          {!isLoading && filteredMedia?.map((media: IMedia) => (
            <div
              key={media?._id}
              className={`overflow-hidden ${viewMode === 'list' ? 'flex' : ''} cursor-pointer`}
              // onClick={() => handleMediaClick(media)}
            >
              <div className={`${viewMode === 'list' ? 'flex items-center' : ''}`}>
                <div className={`${viewMode === 'list' ? 'w-40 mr-4 flex-shrink-0' : 'mb-4'}`}>
                  <div className='relative aspect-video'>
                    <img
                      src={`http://localhost:8080${media?.filePath}`}
                      alt={media?.filename}
                      className='w-full h-full object-cover rounded'
                      onClick={() => handleMediaClick(media)}
                      crossOrigin="anonymous"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      <Tooltip title={isCopy ? 'Đã sao chép' : 'Sao chép link'} placement='right'>
                        <Button shape="circle" icon={<CopyOutlined />} onClick={() => handleCopy(media?.filePath)} />
                      </Tooltip>
                      <Tooltip title="Xóa" placement='right'>
                        <Button
                          shape="circle"
                          danger
                          variant='outlined'
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteMedia(media._id, media.filename)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMedia?.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-500'>Không tìm thấy media nào phù hợp.</p>
          </div>
        )}
      </Content>

      {
        !isLoading && (
          <Footer style={{ backgroundColor: '#fff' }}>
            <div className='flex justify-center'>
              <Pagination defaultCurrent={page} total={50} onChange={setPage} />
            </div>
          </Footer>
        )
      }

      <Modal title={selectedMedia?.filename} open={isModalOpen} onCancel={handleModalClose} footer={null} width={1200}>
        {selectedMedia && (
          <div className='p-2'>
            <div className='mb-6 relative h-[500px] w-full'>
              <img
                src={`http://localhost:8080${selectedMedia.filePath}` || '/placeholder.svg'}
                alt={selectedMedia.filename}
                className='object-cover rounded h-full w-full'
                crossOrigin='anonymous'
              />
              {selectedMedia.fileType === 'video' && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <PlayCircleOutlined className='text-5xl text-white opacity-80' />
                </div>
              )}
            </div>
            <h2 className='text-xl font-bold mb-2'>{selectedMedia.originalname}</h2>
            <p className='text-gray-600 mb-4'>{selectedMedia.originalname}</p>
            <div>
              <p>Loại: {selectedMedia.fileType.charAt(0).toUpperCase() + selectedMedia.fileType.slice(1)}</p>
              <p>Ngày: {convertTimeVietnam(selectedMedia.createdAt)}</p>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}

export default MediaPage
