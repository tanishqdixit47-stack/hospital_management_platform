const router = require('express').Router();
const c = require('../controllers/appointmentController');
const validateObjectId = require('../middleware/validateObjectId');

router.param('id', validateObjectId);

router.route('/').get(c.getAppointments).post(c.createAppointment);
router.route('/:id').put(c.updateAppointment).delete(c.deleteAppointment);

module.exports = router;
