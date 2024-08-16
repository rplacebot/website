'use client'

import { useEffect, useRef, useState, Suspense, Dispatch, SetStateAction } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import NextImage from "next/image"
import '../globals.css'
import ColorPicker from '@/components/ColorPicker' // Adjust the path as needed

const Canvas = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedColor, setSelectedColor] = useState('rgb(0, 0, 0)')
  const [importingColors, setImportingColors] = useState(false)

  const initialColors: Record<string, string> = {}

  const [colors, setColors] = useState(initialColors)
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const width = searchParams.get('width')
  const height = searchParams.get('height')
  const pixelSize = 25 // Size of each pixel in the canvas

  useEffect(() => {
    if (canvasRef.current && width && height) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      // Set canvas dimensions based on width and height from searchParams
      canvas.width = Number(width) * pixelSize
      canvas.height = Number(height) * pixelSize

      if (ctx) {
        ctx.fillStyle = '#131414'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        drawGrid(ctx, Number(width), Number(height))
      }
    }
  }, [width, height])

  // Function to draw grid on the canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0)'
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        ctx.strokeRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize)
      }
    }
  }

  // Function to handle mouse down event
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawPixel(e)
  }

  // Function to handle mouse move event
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons !== 1) {
      updateHoveredPixel(e)
    } else {
      drawPixel(e)
    }
  }

  // Function to update hovered pixel coordinates
  const updateHoveredPixel = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / pixelSize)
    const y = Math.floor((e.clientY - rect.top) / pixelSize)
    setHoveredPixel({ x, y })
  }

  // Function to draw a pixel on the canvas
  const drawPixel = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const rect = canvas.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / pixelSize)
      const y = Math.floor((e.clientY - rect.top) / pixelSize)
      ctx.fillStyle = selectedColor
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
    }
  }

  // Function to handle exporting the canvas as an image
  const handleExportCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const exportCanvas = document.createElement('canvas')

      // Use the original dimensions by dividing by pixelSize
      const exportWidth = canvas.width / pixelSize
      const exportHeight = canvas.height / pixelSize

      exportCanvas.width = exportWidth
      exportCanvas.height = exportHeight

      const ctx = exportCanvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, exportWidth, exportHeight)
        const link = document.createElement('a')
        link.download = `canvas-${exportWidth}x${exportHeight}.png`
        link.href = exportCanvas.toDataURL()
        link.click()
      }
    }
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          setImage(img)
          const canvas = canvasRef.current
          const ctx = canvas?.getContext('2d')
          if (canvas && ctx) {
            const newWidth = img.width * pixelSize
            const newHeight = img.height * pixelSize
            canvas.width = newWidth
            canvas.height = newHeight

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, newWidth, newHeight)
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const getClosestColor = (color: string, palette: Record<string, string>) => {
    const rgb = color.match(/\d+/g)?.map(Number);
    if (!rgb) return color;

    const [r1, g1, b1] = rgb;
    let closestColor = color;
    let closestDistance = Infinity;

    Object.keys(palette).forEach(paletteColor => {
      const paletteRgb = paletteColor.match(/\d+/g)?.map(Number);
      if (!paletteRgb) return;

      const [r2, g2, b2] = paletteRgb;
      const distance = Math.sqrt(
        (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestColor = `rgb${paletteColor}`;
      }
    });

    return closestColor;
  };

  const recolorImage = () => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const color = `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`;
      const closestColor = getClosestColor(color, colors);
      const rgb = closestColor.match(/\d+/g)?.map(Number);

      if (rgb) {
        data[i] = rgb[0];
        data[i + 1] = rgb[1];
        data[i + 2] = rgb[2];
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  return (
    <div className="w-full h-[100vh] overflow-x-hidden flex justify-center items-center relative">
      <div className='w-[calc(100%-50px)]   h-[calc(100%-183px)] rounded-lg absolute bottom-[108px] border-[1px] border-[#232727] overflow-auto'>
        <canvas
          className='rounded-lg'
          ref={canvasRef}
          style={{ imageRendering: 'pixelated' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        />
      </div>
      {hoveredPixel && (
        <div className="text-[#7f8080] text-[15px] font-medium absolute top-[22px] left-20">
          X: {hoveredPixel.x}, Y: {hoveredPixel.y}
        </div>
      )}
      <ColorPicker
        colors={colors}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        importingColors={importingColors}
        setImportingColors={setImportingColors}
        setColors={setColors}
      />
      <NextImage src="/leave.svg" alt="leave" width={24} height={24} onClick={handleBackToHome} className='absolute top-[22px] left-[25px] cursor-pointer leave' />
      <NextImage src="/download.svg" alt="Download" width={24} height={24} onClick={handleExportCanvas} className='absolute top-[22px] right-[25px] cursor-pointer' />
      <button className="px-4 py-2 bg-[#242727] text-[#7f8080] rounded-lg text-[13px] absolute top-4 left-16 font-medium" onClick={handleUpload}>
        Upload
      </button>
      <button className="px-4 py-2 bg-[#242727] text-[#7f8080] rounded-lg text-[13px] absolute top-4 right-[80px] font-medium" onClick={recolorImage}>
        Palette Recolor
      </button>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
    </div>
  )
}

export default function CanvasPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Canvas />
    </Suspense>
  )
}
