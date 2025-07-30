
import type React from 'react'
import { Check } from 'lucide-react'

interface ReasonSelectorProps {
  reasons: string[]
  selectedReason: string
  onReasonChange: (reason: string) => void
  customReason: string
  onCustomReasonChange: (reason: string) => void
  placeholder?: string
}

const ReasonSelector: React.FC<ReasonSelectorProps> = ({
  reasons,
  selectedReason,
  onReasonChange,
  customReason,
  onCustomReasonChange,
  placeholder = 'Nhập lý do cụ thể...'
}) => {
  return (
    <div className='space-y-4'>
      <p className='text-sm font-medium text-gray-700 mb-4'>Vui lòng chọn lý do:</p>

      <div className='space-y-3'>
        {reasons.map((reason) => (
          <label
            key={reason}
            className={`
              flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${
          selectedReason === reason
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }
            `}
          >
            <div
              className={`
              flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 transition-all duration-200
              ${selectedReason === reason ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}
            `}
            >
              {selectedReason === reason && <Check className='w-3 h-3 text-white' />}
            </div>

            <input
              type='radio'
              name='reason'
              value={reason}
              checked={selectedReason === reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className='sr-only'
            />

            <span
              className={`
              text-sm font-medium transition-colors duration-200
              ${selectedReason === reason ? 'text-purple-700' : 'text-gray-700'}
            `}
            >
              {reason}
            </span>
          </label>
        ))}
      </div>

      {/* Custom reason textarea */}
      {selectedReason === 'Khác' && (
        <div className='mt-4 space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>Lý do cụ thể:</label>
          <textarea
            className='w-full border-2 border-gray-200 rounded-lg p-4 text-sm resize-none focus:border-purple-500 focus:ring-0 transition-colors duration-200'
            rows={4}
            placeholder={placeholder}
            value={customReason}
            onChange={(e) => onCustomReasonChange(e.target.value)}
          />
          <p className='text-xs text-gray-500'>Tối thiểu 10 ký tự</p>
        </div>
      )}
    </div>
  )
}

export default ReasonSelector
