const router = require('express').Router();
const c = require('../controllers/doctorController');
const validateObjectId = require('../middleware/validateObjectId');

router.param('id', validateObjectId);

router.route('/').get(c.getDoctors).post(c.createDoctor);
router.route('/:id').put(c.updateDoctor).delete(c.deleteDoctor);

module.exports = router;
