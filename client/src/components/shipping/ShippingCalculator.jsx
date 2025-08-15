import React, { useState, useEffect } from 'react'
import { shippingApi } from '../../apis/shipping.api'

const ShippingCalculator = ({ onShippingFeeChange }) => {
  const [shippingMethods, setShippingMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState('')
  const [shippingData, setShippingData] = useState({
    weight: '',
    distance: '',
    destination: ''
  })
  const [shippingFee, setShippingFee] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchShippingMethods()
  }, [])

  const fetchShippingMethods = async () => {
    try {
      const methods = await shippingApi.getShippingMethods()
      setShippingMethods(methods)
    } catch (error) {
      console.error('Error fetching shipping methods:', error)
    }
  }

  const calculateShippingFee = async () => {
    if (!selectedMethod || !shippingData.weight) return

    setLoading(true)
    try {
      const result = await shippingApi.calculateShippingFee({
        method: selectedMethod,
        ...shippingData
      })
      setShippingFee(result.fee)
      onShippingFeeChange?.(result.fee)
    } catch (error) {
      console.error('Error calculating shipping fee:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="shipping-calculator">
      <h3>Tính phí vận chuyển</h3>
      
      <div className="form-group">
        <label>Phương thức vận chuyển:</label>
        <select 
          value={selectedMethod} 
          onChange={(e) => setSelectedMethod(e.target.value)}
        >
          <option value="">Chọn phương thức</option>
          {shippingMethods.map(method => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Khối lượng (kg):</label>
        <input
          type="number"
          name="weight"
          value={shippingData.weight}
          onChange={handleInputChange}
          placeholder="Nhập khối lượng"
        />
      </div>

      <div className="form-group">
        <label>Khoảng cách (km):</label>
        <input
          type="number"
          name="distance"
          value={shippingData.distance}
          onChange={handleInputChange}
          placeholder="Nhập khoảng cách"
        />
      </div>

      <div className="form-group">
        <label>Địa chỉ giao hàng:</label>
        <input
          type="text"
          name="destination"
          value={shippingData.destination}
          onChange={handleInputChange}
          placeholder="Nhập địa chỉ"
        />
      </div>

      <button 
        onClick={calculateShippingFee}
        disabled={loading || !selectedMethod || !shippingData.weight}
      >
        {loading ? 'Đang tính...' : 'Tính phí vận chuyển'}
      </button>

      {shippingFee > 0 && (
        <div className="shipping-result">
          <strong>Phí vận chuyển: {shippingFee.toLocaleString()} VNĐ</strong>
        </div>
      )}
    </div>
  )
}

export default ShippingCalculator