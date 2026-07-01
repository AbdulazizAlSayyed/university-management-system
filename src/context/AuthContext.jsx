import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useData } from './DataContext'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const STORAGE_KEY = 'ums_uid'

export function AuthProvider({ children }) {
  const { users, updateUser } = useData()
  const [currentUser, setCurrentUser] = useState(null)
  const [booting, setBooting] = useState(true)

  // Restore session (this is a locally-run app, so localStorage is appropriate)
  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY)
    if (savedId) {
      const u = users.find((x) => x.id === savedId && x.status === 'active')
      if (u) setCurrentUser(u)
    }
    setBooting(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep currentUser in sync if their record is edited
  useEffect(() => {
    if (currentUser) {
      const fresh = users.find((u) => u.id === currentUser.id)
      if (fresh && fresh !== currentUser) setCurrentUser(fresh)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users])

  const login = useCallback(
    (identifier, password) => {
      const id = identifier.trim().toLowerCase()
      const user = users.find(
        (u) => u.email.toLowerCase() === id || u.username.toLowerCase() === id
      )
      if (!user || user.password !== password) {
        return { ok: false, error: 'Invalid email/username or password.' }
      }
      if (user.status !== 'active') {
        return {
          ok: false,
          error:
            user.status === 'pending'
              ? 'Your account is pending activation by an administrator.'
              : 'Your account is inactive. Please contact the administrator.',
        }
      }
      setCurrentUser(user)
      localStorage.setItem(STORAGE_KEY, user.id)
      return { ok: true, user }
    },
    [users]
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const updateProfile = useCallback(
    (patch) => {
      if (!currentUser) return
      updateUser(currentUser.id, patch, currentUser.id)
      setCurrentUser((u) => ({ ...u, ...patch }))
    },
    [currentUser, updateUser]
  )

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateProfile, booting }}>
      {children}
    </AuthContext.Provider>
  )
}
