import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { getUserNotifications, markAsRead } from '@/services/notification-service/notification.apis'
import { NOTIFICATION_KEYS } from '@/services/notification-service/notification.keys'

interface Notification {
  _id: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
}

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isSignin } = useSelector((state: RootState) => state.auth)
  const queryClient = useQueryClient()

  const { data: notifications = [] } = useQuery({
    queryKey: [NOTIFICATION_KEYS.FETCH_USER_NOTIFICATIONS],
    queryFn: getUserNotifications,
    select: (res) => res.data?.results || [],
    enabled: isSignin,
    refetchInterval: 30000
  })

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [NOTIFICATION_KEYS.FETCH_USER_NOTIFICATIONS] 
      })
    }
  })

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Vừa xong'
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    return date.toLocaleDateString('vi-VN')
  }

  if (!isSignin || !user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Thông báo</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Không có thông báo nào
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification._id)
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                    )}
                  </div>
                  <div 
                    className="text-sm text-gray-600 mb-2 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: notification.content }}
                  />
                  <div className="text-xs text-gray-400">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Xem tất cả
              </button>
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default NotificationBell