import { asyncHandler } from '../../utils/asyncHandler.js'
import * as svc from './notification.service.js'

export const list = asyncHandler(async (req, res) => res.json(await svc.listMine(req.user._id)))
export const read = asyncHandler(async (req, res) => res.json(await svc.markRead(req.params.id, req.user._id)))
export const readAll = asyncHandler(async (req, res) => { await svc.markAllRead(req.user._id); res.json({ message: 'ok' }) })
