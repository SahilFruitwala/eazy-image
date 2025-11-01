"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "./image-upload"
import { ImagePreview } from "./image-preview"
import { ImageControls } from "./image-controls"
import { CompressionInfo } from "./compression-info"
import { DownloadSection } from "./download-section"
import { FaviconGenerator } from "./favicon-generator"
import Image from "next/image"

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
    const newSettings = {
      ...processedImage,
      width: newWidth,
      height: newHeight,
    }
    setProcessedImage(newSettings)
  }

  useEffect(() => {
    if (uploadedImage && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        canvas.width = uploadedImage.naturalWidth
        canvas.height = uploadedImage.naturalHeight
        ctx.drawImage(uploadedImage, 0, 0)
        setProcessedImage((prev) => ({
          ...prev,
          width: uploadedImage.naturalWidth,
          height: uploadedImage.naturalHeight,
        }))
      }
    }
  }, [uploadedImage])

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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Image src="/favicon.png" alt="Logo" width={24} height={24} />
              </div>
              <h1 className="text-xl font-semibold">Eazy Image</h1>
            </div>
            {uploadedImage && (
              <Button
                variant="outline"
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
                Upload New
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {!uploadedImage ? (
          <div className="max-w-xl mx-auto py-24">
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8">
              <div className="space-y-8">
              <ImagePreview uploadedImage={uploadedImage} processedImage={processedImage} canvasRef={canvasRef} />
            </div>

            <div className="space-y-6">
              <ImageControls
                processedImage={processedImage}
                onProcessImage={handleProcessImage}
                onReset={handleReset}
              />

              {processedImage.width > 0 && (
                <CompressionInfo
                  format={processedImage.format}
                  quality={processedImage.quality}
                  width={processedImage.width}
                  height={processedImage.height}
                />
              )}

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
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
                  Remove Image & Upload New
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
      </main>
    </div>
  )
}
