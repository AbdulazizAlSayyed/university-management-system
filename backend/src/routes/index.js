import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import adminRoutes from '../modules/admin/admin.routes.js'
import notificationRoutes from '../modules/notification/notification.routes.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'

const router = Router()

router.get('/health', (req, res) => res.json({ status: 'ok' }))
router.use('/auth', authRoutes)
router.use('/notifications', verifyToken, notificationRoutes)
router.use('/admin', verifyToken, authorize('admin'), adminRoutes)

export default router
