import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import adminRoutes from '../modules/admin/admin.routes.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'

const router = Router()

router.get('/health', (req, res) => res.json({ status: 'ok' }))

// Shared auth (public)
router.use('/auth', authRoutes)

// Admin area (JWT + admin role required)
router.use('/admin', verifyToken, authorize('admin'), adminRoutes)

// TODO: professor + student modules
// router.use('/professor', verifyToken, authorize('professor'), professorRoutes)
// router.use('/student', verifyToken, authorize('student'), studentRoutes)

export default router
