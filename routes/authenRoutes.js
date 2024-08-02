const express = require("express");
const router = express.Router();
const {registreController, loginController} = require("../controllers/authenController");

router.post('/registre', registreController);
router.post('/login', loginController);



module.exports = router;