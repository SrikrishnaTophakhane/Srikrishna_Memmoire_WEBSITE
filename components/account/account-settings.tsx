"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Loader2, User, MapPin, Trash2, Star, LogOut } from "lucide-react"
import type { Address } from "@/types"

interface AccountSettingsProps {
  user: {
    id: string
    email: string
    full_name?: string
    phone?: string
  }
  addresses: Address[]
}

export function AccountSettings({ user, addresses: initialAddresses }: AccountSettingsProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(user.full_name || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [addresses, setAddresses] = useState(initialAddresses)

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
        .eq("id", user.id)

      if (error) throw error

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleSetDefaultAddress(addressId: string) {
    try {
      const supabase = createClient()

      // First, unset all defaults
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)

      // Set new default
      await supabase.from("addresses").update({ is_default: true }).eq("id", addressId)

      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId,
        })),
      )

      toast.success("Default address updated")
    } catch (error) {
      console.error("Default address error:", error)
      toast.error("Failed to update default address")
    }
  }

  async function handleDeleteAddress(addressId: string) {
    try {
      const supabase = createClient()
      await supabase.from("addresses").delete().eq("id", addressId)

      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId))
      toast.success("Address deleted")
    } catch (error) {
      console.error("Delete address error:", error)
      toast.error("Failed to delete address")
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Saved Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Saved Addresses
          </CardTitle>
          <CardDescription>Manage your delivery addresses</CardDescription>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No saved addresses yet</p>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{address.full_name}</p>
                        {address.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{address.address_line1}</p>
                      {address.address_line2 && (
                        <p className="text-sm text-muted-foreground">{address.address_line2}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
                    </div>
                    <div className="flex gap-2">
                      {!address.is_default && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefaultAddress(address.id)}
                          title="Set as default"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-destructive hover:text-destructive"
                        title="Delete address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
