import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { useData } from './DataContext'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const STORAGE_KEY = 'ums_uid'
const TOKEN_KEY = 'ums_token'
const USER_KEY = 'ums_user_profile'

export function AuthProvider({ children }) {
  const { users, updateUser } = useData()
  const [currentUser, setCurrentUser] = useState(null)
  const [booting, setBooting] = useState(true)

  // Restore session from localStorage persistent state memory on app mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY)
    const savedToken = localStorage.getItem(TOKEN_KEY)
    
    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (e) {
        console.error("Failed to parse saved user session:", e)
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setBooting(false)
  }, [])

  // Keep currentUser state synchronized if changes stream down from the app data context layer
  useEffect(() => {
    if (currentUser && (currentUser._id || currentUser.id)) {
      const targetId = currentUser._id || currentUser.id
      const fresh = users.find((u) => (u._id === targetId || u.id === targetId))
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
        setCurrentUser(fresh)
        localStorage.setItem(USER_KEY, JSON.stringify(fresh))
      }
    }
  }, [users, currentUser])

  // Clean, production-ready backend login bridge architecture
  const login = useCallback(
    async (email, password) => {
      // 1. Send authentication request to your Node server endpoint
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      })

      // 2. Validate the database response envelope structure
      if (response.data && response.data.user) {
        const { user, token } = response.data

        // 3. Optional status validation logic if you keep user activation fields in MongoDB
        if (user.isActive === false || user.status === 'pending') {
          throw new Error('Your account is pending activation by an administrator.')
        }
        if (user.status === 'inactive') {
          throw new Error('Your account is inactive. Please contact the administrator.')
        }

        // 4. Map clean backend names straight to frontend state properties
        const optimizedUser = {
          ...user,
          id: user._id || user.id,                        // Fallback for components looking for 'id' instead of '_id'
          username: user.username || `${user.firstName} ${user.lastName}`, 
          name: user.name || `${user.firstName} ${user.lastName}` // Fallback wrapper for full name strings
        }

        // 5. Save profiles to global context application states
        setCurrentUser(optimizedUser)

        // 6. Commit session details to local storage disk to prevent logout on browser refresh
        localStorage.setItem(STORAGE_KEY, optimizedUser.id)
        localStorage.setItem(USER_KEY, JSON.stringify(optimizedUser))
        if (token) {
          localStorage.setItem(TOKEN_KEY, token)
        }

        return optimizedUser
      }
      
      throw new Error('Invalid server response structure')
    },
    []
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  const updateProfile = useCallback(
    (patch) => {
      if (!currentUser) return
      const targetId = currentUser._id || currentUser.id
      updateUser(targetId, patch, targetId)
      
      setCurrentUser((u) => {
        const updated = { ...u, ...patch }
        localStorage.setItem(USER_KEY, JSON.stringify(updated))
        return updated
      })
    },
    [currentUser, updateUser]
  )

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateProfile, booting }}>
      {children}
    </AuthContext.Provider>
  )
}