"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Move, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface ProductMockupPreviewProps {
  productImage: string
  designImage: string | null
  productType: string
  color: string
  onDesignPositionChange?: (position: { x: number; y: number; scale: number }) => void
}

// Design placement areas for different product types
const DESIGN_AREAS: Record<string, { top: number; left: number; width: number; height: number }> = {
  "T-SHIRT": { top: 20, left: 25, width: 50, height: 40 },
  HOODIE: { top: 22, left: 28, width: 44, height: 35 },
  MUG: { top: 25, left: 20, width: 60, height: 50 },
  HAT: { top: 15, left: 25, width: 50, height: 40 },
}

export function ProductMockupPreview({
  productImage,
  designImage,
  productType,
  color,
  onDesignPositionChange,
}: ProductMockupPreviewProps) {
  const [scale, setScale] = useState(100)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ startX: 0, startY: 0, initialOffsetX: 0, initialOffsetY: 0 })

  const designArea = DESIGN_AREAS[productType] || DESIGN_AREAS["T-SHIRT"]

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!designImage) return
    setIsDragging(true)
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialOffsetX: position.x,
      initialOffsetY: position.y,
    }
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const deltaX = ((e.clientX - dragStartRef.current.startX) / rect.width) * 100
    const deltaY = ((e.clientY - dragStartRef.current.startY) / rect.height) * 100

    const newPosition = {
      x: Math.max(-50, Math.min(50, dragStartRef.current.initialOffsetX + deltaX)),
      y: Math.max(-50, Math.min(50, dragStartRef.current.initialOffsetY + deltaY)),
    }
    setPosition(newPosition)
    onDesignPositionChange?.({ ...newPosition, scale })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!designImage) return
    setIsDragging(true)
    const touch = e.touches[0]
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialOffsetX: position.x,
      initialOffsetY: position.y,
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return

    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const deltaX = ((touch.clientX - dragStartRef.current.startX) / rect.width) * 100
    const deltaY = ((touch.clientY - dragStartRef.current.startY) / rect.height) * 100

    const newPosition = {
      x: Math.max(-50, Math.min(50, dragStartRef.current.initialOffsetX + deltaX)),
      y: Math.max(-50, Math.min(50, dragStartRef.current.initialOffsetY + deltaY)),
    }
    setPosition(newPosition)
    onDesignPositionChange?.({ ...newPosition, scale })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 })
    setScale(100)
    onDesignPositionChange?.({ x: 0, y: 0, scale: 100 })
  }

  const handleScaleChange = (value: number) => {
    setScale(value)
    onDesignPositionChange?.({ ...position, scale: value })
  }

  // Determine if we need light or dark design based on product color
  const isLightProduct = ["White", "Heather Grey", "Sport Grey", "Khaki", "Desert Dust"].includes(color)

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className="relative aspect-square cursor-crosshair select-none bg-muted"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Product Image */}
            <img
              src={productImage || "/placeholder.svg"}
              alt="Product"
              className="h-full w-full object-cover"
              draggable={false}
            />

            {/* Design Overlay */}
            {designImage && (
              <div
                className="absolute cursor-move transition-transform"
                style={{
                  top: `${designArea.top}%`,
                  left: `${designArea.left}%`,
                  width: `${designArea.width}%`,
                  height: `${designArea.height}%`,
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <div
                  className="relative h-full w-full"
                  style={{
                    transform: `translate(${position.x}%, ${position.y}%) scale(${scale / 100})`,
                  }}
                >
                  <img
                    src={designImage || "/placeholder.svg"}
                    alt="Your design"
                    className="h-full w-full object-contain"
                    style={{
                      // Use multiply blend for light products, screen for dark
                      mixBlendMode: isLightProduct ? "multiply" : "screen",
                      opacity: isLightProduct ? 0.9 : 0.85,
                    }}
                    draggable={false}
                  />
                </div>
              </div>
            )}

            {/* Drag indicator when design is present */}
            {designImage && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm">
                <Move className="mr-1.5 inline-block h-3 w-3" />
                Drag to reposition
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Design Controls */}
      {designImage && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Design Size</Label>
              <Button variant="ghost" size="sm" onClick={resetPosition} className="h-8 px-2">
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[scale]}
                onValueChange={([value]) => handleScaleChange(value)}
                min={50}
                max={150}
                step={5}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <span className="w-12 text-right text-sm text-muted-foreground">{scale}%</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
