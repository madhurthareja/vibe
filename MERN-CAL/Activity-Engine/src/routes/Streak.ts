import express from 'express'
import { FetchStreak } from '../controllers/FetchStreak'

const router = express.Router()

router.get('/streak', FetchStreak)

export default router