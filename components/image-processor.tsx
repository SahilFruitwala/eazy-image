"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "./image-upload"
import { ImagePreview } from "./image-preview"
import { ImageControls } from "./image-controls"
import { ImageCrop } from "./image-crop"
import { CompressionInfo } from "./compression-info"
import { DownloadSection } from "./download-section"
import { FaviconGenerator } from "./favicon-generator"

interface ProcessedImage {
  canvas: HTMLCanvasElement | null
  format: string
  quality: number
  width: number
  height: number
}

export function ImageProcessor() {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null)
  const [processedImage, setProcessedImage] = useState<ProcessedImage>({
    canvas: null,
    format: "png",
    quality: 80,
    width: 0,
    height: 0,
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = (image: HTMLImageElement) => {
    setUploadedImage(image)
    const newWidth = image.naturalWidth
    const newHeight = image.naturalHeight
    setProcessedImage((prev) => ({
      ...prev,
      width: newWidth,
      height: newHeight,
    }))
    setTimeout(() => {
      handleProcessImage({ width: newWidth, height: newHeight })
    }, 0)
  }

  const handleProcessImage = (updatedSettings: Partial<ProcessedImage>) => {
    if (!uploadedImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const newSettings = { ...processedImage, ...updatedSettings }

    canvas.width = newSettings.width
    canvas.height = newSettings.height

    ctx.drawImage(uploadedImage, 0, 0, newSettings.width, newSettings.height)

    setProcessedImage(newSettings)
  }

  const handleCropApply = (x: number, y: number, width: number, height: number) => {
    if (!uploadedImage) return

    const croppedCanvas = document.createElement("canvas")
    const croppedCtx = croppedCanvas.getContext("2d")
    if (!croppedCtx) return

    croppedCanvas.width = width
    croppedCanvas.height = height
    croppedCtx.drawImage(uploadedImage, x, y, width, height, 0, 0, width, height)

    const croppedImage = new Image()
    croppedImage.onload = () => {
      setUploadedImage(croppedImage)
      handleProcessImage({ width, height })
    }
    croppedImage.src = croppedCanvas.toDataURL()
  }

  const handleReset = () => {
    if (!uploadedImage) return
    const newWidth = uploadedImage.naturalWidth
    const newHeight = uploadedImage.naturalHeight
    setProcessedImage((prev) => ({
      ...prev,
      width: newWidth,
      height: newHeight,
      format: "png",
      quality: 80,
    }))
    setTimeout(() => {
      handleProcessImage({ width: newWidth, height: newHeight, format: "png", quality: 80 })
    }, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-white text-lg">⬆</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Image Studio</h1>
          </div>
          <p className="text-slate-400">Convert, resize, crop, and optimize your images instantly</p>
        </div>

        {!uploadedImage ? (
          <ImageUpload onImageUpload={handleImageUpload} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview Section */}
            <div className="lg:col-span-2">
              <ImagePreview uploadedImage={uploadedImage} processedImage={processedImage} canvasRef={canvasRef} />
            </div>

            {/* Controls Section */}
            <div className="lg:col-span-1 space-y-6">
              <ImageControls
                processedImage={processedImage}
                onProcessImage={handleProcessImage}
                onReset={handleReset}
              />

              <ImageCrop uploadedImage={uploadedImage} onCropApply={handleCropApply} />

              {processedImage.width > 0 && (
                <CompressionInfo
                  format={processedImage.format}
                  quality={processedImage.quality}
                  width={processedImage.width}
                  height={processedImage.height}
                />
              )}

              {/* Reset & Download */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setUploadedImage(null)
                    setProcessedImage({
                      canvas: null,
                      format: "png",
                      quality: 80,
                      width: 0,
                      height: 0,
                    })
                  }}
                >
                  Upload New Image
                </Button>
              </div>

              {processedImage.width > 0 && (
                <DownloadSection
                  canvasRef={canvasRef}
                  format={processedImage.format}
                  quality={processedImage.quality}
                />
              )}

              {processedImage.width > 0 && <FaviconGenerator image={uploadedImage} />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
