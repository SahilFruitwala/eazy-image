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
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function ImagePreview({ uploadedImage, processedImage, canvasRef }: ImagePreviewProps) {
  return (
    <div className="space-y-6">
      {/* Original Image */}
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Original Image</h3>
        <div className="bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center min-h-80">
          {uploadedImage && (
            <img
              src={uploadedImage.src || "/placeholder.svg"}
              alt="Original"
              className="max-w-full max-h-96 object-contain"
            />
          )}
        </div>
        {uploadedImage && (
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-slate-400">
            <div>
              <p className="text-slate-500 text-xs mb-1">Width</p>
              <p className="text-white font-semibold">{uploadedImage.naturalWidth}px</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Height</p>
              <p className="text-white font-semibold">{uploadedImage.naturalHeight}px</p>
            </div>
          </div>
        )}
      </Card>

      {/* Processed Image */}
      {processedImage.width > 0 && (
        <Card className="p-6 bg-slate-900/50 border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Preview</h3>
          <div className="bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center min-h-80">
            <canvas ref={canvasRef} className="max-w-full max-h-96 object-contain" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs mb-1">Width</p>
              <p className="text-white font-semibold">{processedImage.width}px</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Height</p>
              <p className="text-white font-semibold">{processedImage.height}px</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Format</p>
              <p className="text-white font-semibold uppercase">{processedImage.format}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
