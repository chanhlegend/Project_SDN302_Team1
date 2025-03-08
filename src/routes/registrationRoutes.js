const express = require('express');
const router = express.Router();
const RegistrationForm = require('../app/models/RegistrationForm');
const {
    getAllRegistrationForms,
    approveRegistration,
    rejectRegistration
} = require('../app/controllers/registrationFormController');

router.get('/', getAllRegistrationForms);
router.put('/approve/:formId', approveRegistration);
router.delete('/reject/:formId', rejectRegistration);

module.exports = router;