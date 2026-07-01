import { NavLink } from 'react-router-dom'
import { GraduationCap, X, LogOut } from 'lucide-react'
import { NAV, ROLE_LABEL } from './navConfig'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui'
import { fullName } from '../../utils/helpers'
import { classNames } from '../../utils/helpers'

export default function Sidebar({ open, onClose }) {
  const { currentUser, logout } = useAuth()
  if (!currentUser) return null
  const items = NAV[currentUser.role] || []

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}

      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-slate-100 px-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white shadow-sm">
              <GraduationCap size={20} />
            </span>
            <div className="leading-tight">
              <p className="text-base font-extrabold tracking-tight text-slate-800">UniHub</p>
              <p className="text-[11px] font-medium text-slate-400">University Management</p>
            </div>
          </div>
          <button className="text-slate-400 lg:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {ROLE_LABEL[currentUser.role]}
          </p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => classNames('nav-link', isActive && 'nav-link-active')}
            >
              <item.icon size={19} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar user={currentUser} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-700">{fullName(currentUser)}</p>
              <p className="truncate text-xs text-slate-400">{currentUser.email}</p>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
