'use client'
import Link from 'next/link'
import { useState, useRef } from 'react'

export default function Home() {
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const widthRef = useRef<HTMLInputElement>(null)
  const heightRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value.startsWith('0')) {
      setWidth(value)
    }
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value.startsWith('0')) {
      setHeight(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (document.activeElement === widthRef.current) {
        heightRef.current?.focus()
      } else if (document.activeElement === heightRef.current) {
        buttonRef.current?.focus()
      } else {
        widthRef.current?.focus()
      }
    }
  }

  const isButtonDisabled = !width || !height

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2" onKeyDown={handleKeyDown}>
      <div className="mt-4 grid grid-row-2 gap-3">
        <input
          type="number"
          placeholder="Width"
          value={width}
          ref={widthRef}
          onChange={handleWidthChange}
          className="border-[1px] text-[15px] outline-none rounded-lg px-3 py-2 w-[250px] bg-[#232727]/60 text-[#b5b8b8] placeholder-[#7f8080] border-[#232727]"
        />
        <input
          type="number"
          placeholder="Height"
          value={height}
          ref={heightRef}
          onChange={handleHeightChange}
          className="border-[#232727] text-[15px] border-[1px] outline-none rounded-lg px-3 py-2 bg-[#232727]/60 text-[#b5b8b8] placeholder-[#7f8080]"
        />
        <Link href={`/canvas?width=${width}&height=${height}`}>
          <button
            ref={buttonRef}
            className="mt-2 px-6 py-2 bg-[#232727] text-[#b5b8b8] rounded-lg w-[250px]"
            disabled={isButtonDisabled}
          >
            Create
          </button>
        </Link>
      </div>
    </div>
  )
}
