import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload PNG, JPG, or WebP" }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split(".").pop() || "png"
    const filename = `designs/${user.id}/${timestamp}.${extension}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("designs").upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)

      // If storage bucket doesn't exist, create a data URL fallback
      // In production, you should create the bucket beforehand
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      const dataUrl = `data:${file.type};base64,${base64}`

      return NextResponse.json({
        url: dataUrl,
        message: "Design stored temporarily",
      })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("designs").getPublicUrl(uploadData.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: uploadData.path,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
