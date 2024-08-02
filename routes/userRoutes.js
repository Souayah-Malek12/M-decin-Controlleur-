const express = require("express");
const router = express.Router();
const {updatePasswordController, updateProfileController, consultProfileController, consultCourrierController, addCourrier, searchByNameController, searchByDateController, treatCourrierController} = require("../controllers/userController");
const authMiddleware = require("../middelwares/authMiddleware");

router.put('/', authMiddleware ,updatePasswordController);
router.put('/update', authMiddleware ,updateProfileController);
router.get('/profil', authMiddleware, consultProfileController);
router.get('/', authMiddleware, consultCourrierController);
router.post('/', addCourrier)
router.get('/nsearch', authMiddleware,searchByNameController);
router.get('/tsearch', authMiddleware, searchByDateController);
router.post('/treat', authMiddleware, treatCourrierController);

module.exports = router ;