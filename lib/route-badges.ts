import fs from 'fs'
import path from 'path'

export function getRouteBadges(): Record<string, string> {
  const badges: Record<string, string> = {}
  const adminPath = path.join(process.cwd(), 'app/(admin)/admin')
  
  function scanDirectory(dir: string, basePath: string = '/admin') {
    if (!fs.existsSync(dir)) return
    
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const match = entry.name.match(/^\(([^)]+)\)$/)
        if (match) {
          const badge = match[1]
          const fullPath = path.join(dir, entry.name)
          const subEntries = fs.readdirSync(fullPath, { withFileTypes: true })
          
          for (const subEntry of subEntries) {
            if (subEntry.isDirectory()) {
              const route = `${basePath}/${subEntry.name}`
              badges[route] = badge
            }
          }
        } else {
          scanDirectory(path.join(dir, entry.name), `${basePath}/${entry.name}`)
        }
      }
    }
  }
  
  scanDirectory(adminPath)
  return badges
}
