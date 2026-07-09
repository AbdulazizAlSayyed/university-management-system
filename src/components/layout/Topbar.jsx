import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, User, LogOut, CheckCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { studentApi, professorApi } from '../../api'
import { Avatar } from '../ui'
import { ROLE_LABEL, PROFILE_LINK } from './navConfig'
import { fullName, timeAgo, classNames } from '../../utils/helpers'

function useOutsideClick(ref, onClose) {
  useEffect(() => {
    const handler = (e) => ref.current && !ref.current.contains(e.target) && onClose()
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

export default function Topbar({ onMenu }) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef = useRef(null)
  const menuRef = useRef(null)
  useOutsideClick(notifRef, () => setNotifOpen(false))
  useOutsideClick(menuRef, () => setMenuOpen(false))

  const api = currentUser?.role === 'professor' ? professorApi : studentApi

  const loadNotifs = useCallback(async () => {
    try {
      const res = await api.getNotifications()
      setNotifications(res.notifications || [])
    } catch { /* ignore */ }
  }, [api])

  useEffect(() => {
    loadNotifs()
    const interval = setInterval(loadNotifs, 30000)
    return () => clearInterval(interval)
  }, [loadNotifs])

  const myNotifs = notifications
  const unread = myNotifs.filter((n) => !n.read).length

  const markNotificationRead = useCallback(async (id) => {
    try {
      await api.markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n)))
    } catch { /* ignore */ }
  }, [api])

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch { /* ignore */ }
  }, [api])

  const openNotif = (n) => {
    markNotificationRead(n._id || n.id)
    setNotifOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={onMenu}>
        <Menu size={22} />
      </button>

      <div className="hidden sm:block">
        <p className="text-sm font-semibold text-slate-700">Welcome back, {currentUser.firstName} 👋</p>
        <p className="text-xs text-slate-400">{ROLE_LABEL[currentUser.role]} · Fall 2026</p>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right animate-fade-in rounded-xl border border-slate-200 bg-white shadow-xl sm:w-96">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="font-semibold text-slate-800">Notifications</p>
                {unread > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {myNotifs.length === 0 && (
                  <p className="px-4 py-10 text-center text-sm text-slate-400">You're all caught up.</p>
                )}
                {myNotifs.map((n) => (
                  <div
                    key={n._id || n.id}
                    className={classNames(
                      'group flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50',
                      !n.read && 'bg-brand-50/40'
                    )}
                  >
                    <button
                      onClick={() => openNotif(n)}
                      className={classNames('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-slate-300' : 'bg-brand-500')}
                    />
                    <button onClick={() => openNotif(n)} className="min-w-0 flex-1 text-left">
                      <span className="block text-sm font-semibold text-slate-700">{n.title}</span>
                      <span className="block truncate text-xs text-slate-500">{n.body}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                    </button>
                    {!n.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markNotificationRead(n._id || n.id) }}
                        className="mt-1 shrink-0 rounded p-1 text-xs text-slate-400 opacity-0 transition hover:text-brand-600 group-hover:opacity-100"
                        title="Mark as read"
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition hover:bg-slate-100"
          >
            <Avatar user={currentUser} size="sm" />
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-slate-700">{fullName(currentUser)}</span>
              <span className="block text-xs leading-tight text-slate-400">{ROLE_LABEL[currentUser.role]}</span>
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right animate-fade-in rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">{fullName(currentUser)}</p>
                <p className="truncate text-xs text-slate-400">{currentUser.email}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate(PROFILE_LINK[currentUser.role]) }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <User size={17} /> My Profile
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
