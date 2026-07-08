import { Router } from 'express'
import * as c from './notification.controller.js'

const router = Router()
router.get('/', c.list)
router.patch('/read-all', c.readAll)
router.patch('/:id/read', c.read)
export default router
