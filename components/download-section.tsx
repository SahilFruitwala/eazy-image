"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface DownloadSectionProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  format: string
  quality: number
}

export function DownloadSection({ canvasRef, format, quality }: DownloadSectionProps) {
  const handleDownload = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const link = document.createElement("a")
    link.download = `eazy-image-${Date.now()}.${format}`
    link.href = canvas.toDataURL(`image/${format}`, quality / 100)
    link.click()
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Download</h3>
        <div className="space-y-2">
          <Button onClick={handleDownload} className="w-full">
            Download Image
          </Button>
        </div>
      </div>
    </div>
  )
}
