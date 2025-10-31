"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface EmailAddress {
  id: number
  uuid: string
  address: string
}

interface EmailContextType {
  emails: EmailAddress[]
  refreshEmails: () => Promise<void>
}

const EmailContext = createContext<EmailContextType | undefined>(undefined)

export function EmailProvider({ children }: { children: React.ReactNode }) {
  const [emails, setEmails] = useState<EmailAddress[]>([])

  const refreshEmails = async () => {
    try {
      const res = await fetch('/api/admin/emails')
      if (res.ok) {
        const data = await res.json()
        setEmails(data)
      }
    } catch {}
  }

  useEffect(() => {
    refreshEmails()
  }, [])

  return (
    <EmailContext.Provider value={{ emails, refreshEmails }}>
      {children}
    </EmailContext.Provider>
  )
}

export function useEmails() {
  const context = useContext(EmailContext)
  if (!context) throw new Error('useEmails must be used within EmailProvider')
  return context
}
