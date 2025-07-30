'use client'

import type React from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  show: boolean
  onClose: () => void
  onConfirm?: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ title, show, onClose, onConfirm, children }) => {
  if (!show) return null

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50'>
      {/* Backdrop with blur effect */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />

      {/* Modal content */}
      <div className='relative bg-white rounded-xl w-[500px] max-w-[90vw] shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-100'>
          <h3 className='text-xl font-semibold text-gray-900'>{title}</h3>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>{children}</div>

        {/* Footer */}
        <div className='flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50'>
          <Button variant='outline' onClick={onClose} className='px-6 py-2.5'>
            Hủy
          </Button>
          {onConfirm && (
            <Button onClick={onConfirm} className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5'>
              Xác nhận
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal
