import mongoose from 'mongoose'
import AddressModel from '../models/address.model'

// Script để xóa dữ liệu địa chỉ test
const cleanTestAddresses = async () => {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database')
    
    console.log('Đang tìm kiếm dữ liệu test...')
    
    // Tìm và xóa các địa chỉ có chứa từ "test"
    const testAddresses = await AddressModel.find({
      $or: [
        { province: { $regex: /test/i } },
        { district: { $regex: /test/i } },
        { ward: { $regex: /test/i } },
        { address: { $regex: /test/i } }
      ]
    })
    
    console.log(`Tìm thấy ${testAddresses.length} địa chỉ test:`)
    testAddresses.forEach(addr => {
      console.log(`- ID: ${addr._id}, Province: ${addr.province}, District: ${addr.district}, Ward: ${addr.ward}`)
    })
    
    if (testAddresses.length > 0) {
      // Xóa các địa chỉ test
      const result = await AddressModel.deleteMany({
        $or: [
          { province: { $regex: /test/i } },
          { district: { $regex: /test/i } },
          { ward: { $regex: /test/i } },
          { address: { $regex: /test/i } }
        ]
      })
      
      console.log(`Đã xóa ${result.deletedCount} địa chỉ test`)
    } else {
      console.log('Không tìm thấy dữ liệu test nào trong database')
    }
    
    await mongoose.disconnect()
    console.log('Hoàn thành!')
    
  } catch (error) {
    console.error('Lỗi:', error)
    process.exit(1)
  }
}

// Chạy script
cleanTestAddresses()