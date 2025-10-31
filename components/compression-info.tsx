"use client"

import { Card } from "@/components/ui/card"

interface CompressionInfoProps {
  format: string
  quality: number
  width: number
  height: number
}

export function CompressionInfo({ format, quality, width, height }: CompressionInfoProps) {
  const estimateFileSize = () => {
    const pixels = width * height
    const bytesPerPixel = format === "png" ? 4 : 3
    const compressionRatio = quality / 100
    return (pixels * bytesPerPixel * compressionRatio) / 1024
  }

  const fileSize = estimateFileSize()

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Compression Info</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated Size</span>
            <span className="text-sm font-semibold">
              {fileSize > 1024
                ? `${(fileSize / 1024).toFixed(2)} MB`
                : `${fileSize.toFixed(2)} KB`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quality</span>
            <span className="text-sm font-semibold">{quality}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Format</span>
            <span className="text-sm font-semibold uppercase">{format}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
