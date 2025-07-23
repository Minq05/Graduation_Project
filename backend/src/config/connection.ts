import mongoose from 'mongoose'
import configEnv from './env'

interface IDBState {
  value: number
  label: string
}
const dbState: IDBState[] = [
  { value: 0, label: 'Disconnected' },
  { value: 1, label: 'Connected' },
  { value: 2, label: 'Connecting' },
  { value: 3, label: 'Disconnecting' }
]

const connection = async () => {
  try {
    const option = {
      user: configEnv.mongoose.username,
      pass: configEnv.mongoose.password,
      dbName: configEnv.mongoose.username
    }
    await mongoose.connect(configEnv.mongoose.uri, option)
    const state = Number(mongoose.connection.readyState)
    console.log('🚀', dbState.find((f) => f.value === state)?.label, 'to database.')
  } catch (error) {
    console.log('🚀 ~ connect ~ error:', error)
  }
}

export default connection
