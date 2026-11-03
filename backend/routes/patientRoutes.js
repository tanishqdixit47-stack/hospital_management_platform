const router = require('express').Router();
const c = require('../controllers/patientController');
const validateObjectId = require('../middleware/validateObjectId');

router.param('id', validateObjectId);

router.route('/').get(c.getPatients).post(c.createPatient);
router.route('/:id').get(c.getPatient).put(c.updatePatient).delete(c.deletePatient);

module.exports = router;
