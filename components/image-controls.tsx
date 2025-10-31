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
  const [expandedSections, setExpandedSections] = useState({
    format: true,
    resize: true,
    quality: true,
  })

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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

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

  const applyQualityPreset = (presetQuality: number) => {
    setQuality(presetQuality)
    onProcessImage({ quality: presetQuality })
  }

  const applyPreset = (preset: { width: number; height: number; label: string }) => {
    setWidth(preset.width)
    setHeight(preset.height)
    onProcessImage({
      width: preset.width,
      height: preset.height,
    })
  }

  return (
    <div className="space-y-3">
      {/* Format Section */}
      <Card className="bg-slate-900/50 border-slate-700 p-4">
        <button onClick={() => toggleSection("format")} className="w-full flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Format Conversion</h3>
          <span
            className={`text-slate-400 transition-transform ${expandedSections.format ? "rotate-180 inline-block" : ""}`}
          >
            ▼
          </span>
        </button>

        {expandedSections.format && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {FORMAT_OPTIONS.map((format) => (
                <button
                  key={format.value}
                  onClick={() => handleFormatChange(format.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedFormat === format.value
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {format.label}
                </button>
              ))}
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
              <p className="font-semibold text-slate-300 mb-2">Selected: {selectedFormat.toUpperCase()}</p>
              <p>{FORMAT_OPTIONS.find((f) => f.value === selectedFormat)?.description}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Resize Section */}
      <Card className="bg-slate-900/50 border-slate-700 p-4">
        <button onClick={() => toggleSection("resize")} className="w-full flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Resize Image</h3>
          <span
            className={`text-slate-400 transition-transform ${expandedSections.resize ? "rotate-180 inline-block" : ""}`}
          >
            ▼
          </span>
        </button>

        {expandedSections.resize && (
          <div className="space-y-4">
            {/* Presets */}
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Quick Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { width: 800, height: 600, label: "800x600" },
                  { width: 1024, height: 768, label: "1024x768" },
                  { width: 1280, height: 720, label: "1280x720" },
                  { width: 1920, height: 1080, label: "1920x1080" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-2 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Dimensions */}
            <div>
              <Label className="text-xs text-slate-400 mb-2 block">Custom Size</Label>
              <div className="space-y-2">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 block mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(Number.parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 block mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(Number.parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={maintainAspect}
                    onChange={(e) => setMaintainAspect(e.target.checked)}
                    className="rounded border-slate-600"
                  />
                  Maintain aspect ratio
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleResize}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white"
              >
                Apply Resize
              </Button>
              <Button onClick={() => onReset()} variant="outline" className="w-full">
                Reset
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Quality Section */}
      <Card className="bg-slate-900/50 border-slate-700 p-4">
        <button onClick={() => toggleSection("quality")} className="w-full flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Quality & Compression</h3>
          <span
            className={`text-slate-400 transition-transform ${expandedSections.quality ? "rotate-180 inline-block" : ""}`}
          >
            ▼
          </span>
        </button>

        {expandedSections.quality && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-400">Quality Level</label>
                <span className="text-sm font-semibold text-cyan-400">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => handleQualityChange(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => applyQualityPreset(30)}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  quality === 30
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Low
              </button>
              <button
                onClick={() => applyQualityPreset(50)}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  quality === 50
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => applyQualityPreset(80)}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  quality === 80
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                High
              </button>
              <button
                onClick={() => applyQualityPreset(100)}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  quality === 100
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Max
              </button>
            </div>

            <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Quality Guide:</p>
              <ul className="space-y-1">
                <li>• 10-30%: Maximum compression, low quality</li>
                <li>• 40-60%: Balanced compression and quality</li>
                <li>• 70-100%: High quality, larger file size</li>
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
