"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface ImageControlsProps {
  processedImage: {
    canvas: HTMLCanvasElement | null
    format: string
    quality: number
    width: number
    height: number
  }
  onProcessImage: (settings: Partial<any>) => void
  onReset: () => void
}

const FORMAT_OPTIONS = [
  { value: "png", label: "PNG", mime: "image/png", description: "Lossless, best for transparency" },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg", description: "Compressed, good for photos" },
  { value: "webp", label: "WebP", mime: "image/webp", description: "Modern, smaller files" },
  { value: "bmp", label: "BMP", mime: "image/bmp", description: "Uncompressed bitmap" },
]

export function ImageControls({ processedImage, onProcessImage, onReset }: ImageControlsProps) {
  const [width, setWidth] = useState(processedImage.width)
  const [height, setHeight] = useState(processedImage.height)
  const [maintainAspect, setMaintainAspect] = useState(true)
  const [quality, setQuality] = useState(processedImage.quality)
  const [selectedFormat, setSelectedFormat] = useState(processedImage.format || "png")

  useEffect(() => {
    setWidth(processedImage.width)
    setHeight(processedImage.height)
    setQuality(processedImage.quality)
    setSelectedFormat(processedImage.format)
  }, [processedImage.width, processedImage.height, processedImage.quality, processedImage.format])

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format)
    onProcessImage({ format })
  }

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    if (maintainAspect && processedImage.height > 0) {
      const aspectRatio = processedImage.height / processedImage.width
      setHeight(Math.round(newWidth * aspectRatio))
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    if (maintainAspect && processedImage.width > 0) {
      const aspectRatio = processedImage.width / processedImage.height
      setWidth(Math.round(newHeight * aspectRatio))
    }
  }

  const handleResize = () => {
    onProcessImage({
      width,
      height,
    })
  }

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality)
    onProcessImage({ quality: newQuality })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Image Controls</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Format</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {FORMAT_OPTIONS.map((format) => (
                  <Button
                    key={format.value}
                    variant={selectedFormat === format.value ? "default" : "secondary"}
                    onClick={() => handleFormatChange(format.value)}
                    className="w-full"
                  >
                    {format.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm">Resize</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-1">
                  <Label htmlFor="width" className="text-xs">Width</Label>
                  <input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Number.parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="height" className="text-xs">Height</Label>
                  <input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Number.parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="aspect-ratio"
                  type="checkbox"
                  checked={maintainAspect}
                  onChange={(e) => setMaintainAspect(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="aspect-ratio" className="text-sm text-muted-foreground">
                  Maintain aspect ratio
                </Label>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleResize} className="w-full">Apply Resize</Button>
                <Button onClick={() => onReset()} variant="secondary" className="w-full">Reset</Button>
              </div>
            </div>

            <div>
              <Label className="text-sm">Quality</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => handleQualityChange(Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                  {quality}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
