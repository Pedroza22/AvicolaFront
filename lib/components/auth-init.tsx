"use client"

import { useEffect } from "react"
import { useAppState } from "@/lib/hooks/use-app-state"
import { AuthService } from "@/lib/services/auth.service"

export default function AuthInit() {
  const setUser = useAppState((s) => s.setUser)

  useEffect(() => {
    AuthService.initialize(setUser)
  }, [setUser])

  return null
}
