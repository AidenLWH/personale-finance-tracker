import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  
  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.brandIcon}>💰</span>
        <span style={styles.brandName}>Finance Tracker</span>
      </div>

      <div style={styles.links}>
        <Link
          to="/dashboard"
          style={{
            ...styles.link,
            ...(isActive('/dashboard') ? styles.activeLink : {})
          }}
        >
          Dashboard
        </Link>
        <Link
          to="/transactions"
          style={{
            ...styles.link,
            ...(isActive('/transactions') ? styles.activeLink : {})
          }}
        >
          Transactions
        </Link>
        <Link
          to="/budgets"
          style={{
            ...styles.link,
            ...(isActive('/budgets') ? styles.activeLink : {})
          }}
        >
          Budgets
        </Link>
      </div>

      <div style={styles.userSection}>
        <span style={styles.userName}>👤 {user?.name}</span>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: 'white',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  brandIcon: {
    fontSize: '20px',
  },
  brandName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  links: {
    display: 'flex',
    gap: '8px',
  },
  link: {
    padding: '6px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
    transition: 'background 0.15s',
  },
  activeLink: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userName: {
    fontSize: '14px',
    color: '#555',
  },
  logoutBtn: {
    padding: '6px 14px',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#555',
    cursor: 'pointer',
  },
}