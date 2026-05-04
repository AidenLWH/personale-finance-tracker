import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem('token'))
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem('user') || 'null')
  )

  const login = (authResponse) => {
    setToken(authResponse.token)
    setUser({ name: authResponse.name, email: authResponse.email })
    sessionStorage.setItem('token', authResponse.token)
    sessionStorage.setItem('user', JSON.stringify({
      name: authResponse.name,
      email: authResponse.email
    }))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}