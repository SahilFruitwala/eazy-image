"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ImageCropProps {
  uploadedImage: HTMLImageElement | null
  onCropApply: (x: number, y: number, width: number, height: number) => void
}

export function ImageCrop({ uploadedImage, onCropApply }: ImageCropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [cropRect, setCropRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const [previewMode, setPreviewMode] = useState(false)

  // Initialize canvas with image
  useEffect(() => {
    if (!uploadedImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to fit image
    const maxWidth = 400
    const maxHeight = 300
    const scale = Math.min(maxWidth / uploadedImage.naturalWidth, maxHeight / uploadedImage.naturalHeight)

    canvas.width = uploadedImage.naturalWidth * scale
    canvas.height = uploadedImage.naturalHeight * scale

    // Draw image
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height)

    // Initialize crop rect to full image
    setCropRect({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    })
  }, [uploadedImage])

  const drawCropOverlay = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx || !uploadedImage) return

    // Redraw image
    const scale = canvas.width / uploadedImage.naturalWidth
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height)

    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Clear crop area
    ctx.clearRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height)
    ctx.drawImage(
      uploadedImage,
      (cropRect.x / canvas.width) * uploadedImage.naturalWidth,
      (cropRect.y / canvas.height) * uploadedImage.naturalHeight,
      (cropRect.width / canvas.width) * uploadedImage.naturalWidth,
      (cropRect.height / canvas.height) * uploadedImage.naturalHeight,
      cropRect.x,
      cropRect.y,
      cropRect.width,
      cropRect.height,
    )

    // Draw crop border
    ctx.strokeStyle = "#06B6D4"
    ctx.lineWidth = 2
    ctx.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height)
  }

  useEffect(() => {
    drawCropOverlay()
  }, [cropRect, uploadedImage])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    setIsDragging(true)
    setStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    const newWidth = Math.max(50, Math.abs(currentX - startPos.x))
    const newHeight = Math.max(50, Math.abs(currentY - startPos.y))
    const newX = Math.min(startPos.x, currentX)
    const newY = Math.min(startPos.y, currentY)

    setCropRect({
      x: Math.max(0, Math.min(newX, canvasRef.current.width - newWidth)),
      y: Math.max(0, Math.min(newY, canvasRef.current.height - newHeight)),
      width: Math.min(newWidth, canvasRef.current.width - newX),
      height: Math.min(newHeight, canvasRef.current.height - newY),
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const applyCrop = () => {
    if (!uploadedImage) return

    // Convert canvas coordinates back to original image coordinates
    const scale = uploadedImage.naturalWidth / canvasRef.current!.width
    const actualX = Math.round(cropRect.x * scale)
    const actualY = Math.round(cropRect.y * scale)
    const actualWidth = Math.round(cropRect.width * scale)
    const actualHeight = Math.round(cropRect.height * scale)

    onCropApply(actualX, actualY, actualWidth, actualHeight)
    setPreviewMode(true)
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700 p-4">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Crop Image</h3>
        <span className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180 inline-block" : ""}`}>▼</span>
      </button>

      {isExpanded && uploadedImage && (
        <div className="space-y-4">
          {!previewMode ? (
            <>
              <div className="text-xs text-slate-400 mb-3">Click and drag to create a crop selection</div>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full rounded-lg cursor-crosshair border border-slate-700"
              />
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                <div>
                  <p className="text-slate-500 mb-1">X</p>
                  <p className="text-white font-semibold">{Math.round(cropRect.x)}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Y</p>
                  <p className="text-white font-semibold">{Math.round(cropRect.y)}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Size</p>
                  <p className="text-white font-semibold">
                    {Math.round(cropRect.width)}x{Math.round(cropRect.height)}
                  </p>
                </div>
              </div>
              <Button
                onClick={applyCrop}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white"
              >
                Apply Crop
              </Button>
            </>
          ) : (
            <div className="text-sm text-slate-300">
              <p className="mb-3">Crop applied successfully!</p>
              <Button onClick={() => setPreviewMode(false)} variant="outline" className="w-full bg-transparent">
                Adjust Crop
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
