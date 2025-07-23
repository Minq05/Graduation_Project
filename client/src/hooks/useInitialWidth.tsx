import { useState, useEffect } from 'react'

const useInitialWidth = () => {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    setWidth(window.innerWidth)
  }, [])

  return width
}

export default useInitialWidth
