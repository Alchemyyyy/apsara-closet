import express from 'express'
import {
  getUserAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/address.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

router.get('/', getUserAddresses)
router.get('/:id', getAddress)
router.post('/', createAddress)
router.put('/:id', updateAddress)
router.delete('/:id', deleteAddress)
router.patch('/:id/set-default', setDefaultAddress)

export default router
