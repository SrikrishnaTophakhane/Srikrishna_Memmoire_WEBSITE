import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AccountSettings } from "@/components/account/account-settings"

export const metadata = {
  title: "Account Settings | Memmoire",
  description: "Manage your account settings",
}

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login?redirect=/account")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Account Settings</h1>
      <AccountSettings
        user={{
          id: user.id,
          email: user.email || "",
          ...profile,
        }}
        addresses={addresses || []}
      />
    </div>
  )
}
