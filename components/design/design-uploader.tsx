"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"

interface DesignUploaderProps {
  productId: number
  onDesignUploaded: (designUrl: string, mockupUrl?: string) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]

export function DesignUploader({ productId, onDesignUploaded }: DesignUploaderProps) {
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Please upload a PNG, JPG, or WebP image"
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB"
    }
    return null
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const processFile = async (file: File) => {
    const error = validateFile(file)
    if (error) {
      toast({
        title: "Invalid file",
        description: error,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create preview immediately using data URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPreviewUrl(dataUrl)
        // Immediately pass the design to parent for live preview
        onDesignUploaded(dataUrl)
      }
      reader.readAsDataURL(file)

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      // Upload to API
      const formData = new FormData()
      formData.append("file", file)
      formData.append("productId", productId.toString())

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(interval)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      setUploadProgress(100)

      // Update with actual uploaded URL if available
      if (data.url) {
        onDesignUploaded(data.url)
      }

      toast({
        title: "Design uploaded",
        description: "Your design is ready for preview!",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload design. Please try again.",
        variant: "destructive",
      })
      // Keep the local preview even if upload fails
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const clearDesign = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {!previewUrl ? (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="mb-1 text-center font-medium">Drag and drop your design here</p>
            <p className="mb-4 text-center text-sm text-muted-foreground">PNG, JPG or WebP up to 10MB</p>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Design preview"
                  className="h-full w-full object-contain"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Design Ready</p>
                    <p className="text-xs text-muted-foreground">See preview on product</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearDesign} className="h-8 w-8">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove design</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-1.5" />
          <p className="text-center text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
        </div>
      )}
    </div>
  )
}
