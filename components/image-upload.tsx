"use client"

import type React from "react"
import { useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onImageUpload: (image: HTMLImageElement) => void
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        onImageUpload(img)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    dropZoneRef.current?.classList.add("border-cyan-400", "bg-cyan-400/5")
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dropZoneRef.current?.classList.remove("border-cyan-400", "bg-cyan-400/5")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dropZoneRef.current?.classList.remove("border-cyan-400", "bg-cyan-400/5")
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <Card
      ref={dropZoneRef}
      className="border-2 border-dashed border-slate-700 rounded-lg p-8 md:p-12 text-center cursor-pointer transition-colors hover:border-cyan-400 hover:bg-cyan-400/5"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-linear-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center">
          <span className="text-cyan-400 text-3xl">🖼</span>
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">Upload Your Image</h2>
          <p className="text-slate-400 mb-4">Drag and drop your image here or click to browse</p>
          <p className="text-sm text-slate-500">Supports JPG, PNG, WebP, BMP and more</p>
        </div>
        <Button className="mt-4 bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white">
          Choose Image
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />
    </Card>
  )
}
