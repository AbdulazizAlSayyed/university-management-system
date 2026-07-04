import { Router } from 'express'
import { signup, login, me } from './auth.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'

const router = Router()

router.post('/signup', signup)
router.post('/register', signup) // alias for the same handler
router.post('/login', login)
router.get('/me', verifyToken, me)

export default router
