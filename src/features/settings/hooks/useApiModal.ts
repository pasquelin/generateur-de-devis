import { create } from 'zustand'

interface ApiModalStore {
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useApiModalStore = create<ApiModalStore>(set => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}))

export const useApiModal = () => useApiModalStore()
