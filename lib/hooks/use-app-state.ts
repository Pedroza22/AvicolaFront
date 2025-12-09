import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AppState, User } from "@/lib/types"

interface AppStore extends AppState {
  setSelectedFarm: (farmId: string | undefined) => void
  setSelectedShed: (shedId: string | undefined) => void
  setSelectedLote: (loteId: string | undefined) => void
  setSelectedRole: (role: string) => void
  setUser: (user: User | null) => void
}

export const useAppState = create<AppStore>()(
  persist(
    (set) => ({
      selectedFarm: undefined,
      selectedShed: undefined,
      selectedLote: undefined,
      selectedRole: "admin-empresa",
      user: null,

      setSelectedFarm: (farmId) => set({ selectedFarm: farmId }),
      setSelectedShed: (shedId) => set({ selectedShed: shedId }),
      setSelectedLote: (loteId) => set({ selectedLote: loteId }),
      setSelectedRole: (role) => set({ selectedRole: role }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "app-state-v2",
    },
  ),
)
