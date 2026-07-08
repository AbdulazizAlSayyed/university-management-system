import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const STORAGE_KEY = 'ums_uid'
const TOKEN_KEY = 'ums_token'
const USER_KEY = 'ums_user_profile'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [booting, setBooting] = useState(true)

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

        // 3. Check if account is active
        if (user.status === 'pending') {
          throw new Error('Your account is pending activation by an administrator.')
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
      setCurrentUser((u) => {
        const updated = { ...u, ...patch }
        localStorage.setItem(USER_KEY, JSON.stringify(updated))
        return updated
      })
    },
    [currentUser]
  )

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateProfile, booting }}>
      {children}
    </AuthContext.Provider>
  )
}