const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  generateMessage,
  getTemplates,
  upsertTemplate,
  getFollowUpHistory
} = require('../controllers/whatsappController');

const router = express.Router();

router.use(protect, authorize('owner', 'manager', 'receptionist', 'trainer'));

router.post('/generate', [body('messageType').notEmpty()], validate, generateMessage);
router.get('/templates', getTemplates);
router.put('/templates/:type', authorize('owner', 'manager'), upsertTemplate);
router.get('/history', getFollowUpHistory);

module.exports = router;
