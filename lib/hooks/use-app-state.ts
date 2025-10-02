import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AppState, User } from "@/lib/types"

interface AppStore extends AppState {
  setSelectedFarm: (farmId: string) => void
  setSelectedShed: (shedId: string) => void
  setSelectedLote: (loteId: string) => void
  setSelectedRole: (role: string) => void
  setUser: (user: User | null) => void
}

export const useAppState = create<AppStore>()(
  persist(
    (set) => ({
      selectedFarm: "granja-1",
      selectedShed: "galpon-1",
      selectedLote: "lote-09",
      selectedRole: "admin-empresa",
      user: null,

      setSelectedFarm: (farmId) => set({ selectedFarm: farmId }),
      setSelectedShed: (shedId) => set({ selectedShed: shedId }),
      setSelectedLote: (loteId) => set({ selectedLote: loteId }),
      setSelectedRole: (role) => set({ selectedRole: role }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "app-state",
    },
  ),
)
