import { useMap } from 'react-leaflet'
import { useEffect } from 'react'

const CustomZoomControl = () => {
  const map = useMap()

  useEffect(() => {
    map.zoomControl.remove()
  }, [map])

  return (
    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="w-10 h-10 bg-white text-xl font-bold rounded-md shadow hover:bg-gray-100 transition"
        title="Приблизить"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-10 h-10 bg-white text-xl font-bold rounded-md shadow hover:bg-gray-100 transition"
        title="Отдалить"
      >
        −
      </button>
    </div>
  )
}

export default CustomZoomControl