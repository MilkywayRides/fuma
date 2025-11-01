'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface DeveloperModeContextType {
  developerMode: boolean
  setDeveloperMode: (mode: boolean) => void
}

const DeveloperModeContext = createContext<DeveloperModeContextType | undefined>(undefined)

export function DeveloperModeProvider({ children, initialMode }: { children: ReactNode, initialMode: boolean }) {
  const [developerMode, setDeveloperMode] = useState(initialMode)

  return (
    <DeveloperModeContext.Provider value={{ developerMode, setDeveloperMode }}>
      {children}
    </DeveloperModeContext.Provider>
  )
}

export function useDeveloperMode() {
  const context = useContext(DeveloperModeContext)
  if (context === undefined) {
    throw new Error('useDeveloperMode must be used within a DeveloperModeProvider')
  }
  return context
}
