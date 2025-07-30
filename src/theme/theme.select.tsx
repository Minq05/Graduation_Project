import { useSystemTheme } from '@/hooks/useSystemTheme'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setStateThemeMode } from '@/redux/slices/app.slices'
import { Select } from 'antd'
import { useEffect } from 'react'

const ThemeSelect = () => {
  const themeMode = useAppSelector(state => state.app.themeMode)
  const dispatch = useAppDispatch()

  const systemTheme = useSystemTheme()
  const handleChange = (value: string) => {
    dispatch(setStateThemeMode(value))
  }

  // Set theme mode to system theme
  useEffect(() => {
    if (themeMode === 'system') {
      dispatch(setStateThemeMode(systemTheme))
    }
  }, [systemTheme, themeMode, dispatch])

  return (
    <div>
      <Select
        defaultValue={themeMode}
        style={{ width: 120 }}
        onChange={handleChange}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' }
        ]}
      />
    </div>
  )
}

export default ThemeSelect
