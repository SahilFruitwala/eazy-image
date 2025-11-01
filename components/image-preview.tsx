"use client"

import type React from "react"

import { Card } from "@/components/ui/card"

interface ImagePreviewProps {
  uploadedImage: HTMLImageElement | null
  processedImage: {
    canvas: HTMLCanvasElement | null
    format: string
    quality: number
    width: number
    height: number
  }
  canvasRef: React.RefObject<HTMLCanvasElement| null>
}

export function ImagePreview({ uploadedImage, processedImage, canvasRef }: ImagePreviewProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Original Image</h3>
          <div className="bg-muted/50 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
            {uploadedImage && (
              <img
                src={uploadedImage.src || "/placeholder.svg"}
                alt="Original"
                className="max-w-full max-h-[400px] object-contain"
              />
            )}
          </div>
          {uploadedImage && (
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Width</p>
                <p className="font-semibold">{uploadedImage.naturalWidth}px</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Height</p>
                <p className="font-semibold">{uploadedImage.naturalHeight}px</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Processed Image</h3>
          <div className="bg-muted/50 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
            <canvas ref={canvasRef} className="max-w-full max-h-[400px] object-contain" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Width</p>
              <p className="font-semibold">{processedImage.width}px</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Height</p>
              <p className="font-semibold">{processedImage.height}px</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Format</p>
              <p className="font-semibold uppercase">{processedImage.format}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}