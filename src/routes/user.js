const express = require("express");

const auth = require("../middleware/auth");
const loginValidator = require("../middleware/validation/loginValidation");

const { getAllCategories } = require("../controller/category.controller");
const { register, login, status, reGenerateToken, logoutUser } = require("../controller/user.controller");
const {  getAllFiles, getMainFile, getRelatedFiles } = require("../controller/content.controller");
const { getLatestTag } = require("../controller/tag.controller");
const { getFilter } = require("../controller/filter.controller");

const router = express.Router();

router.post("/sign-up", register);
router.post("/login" ,loginValidator,login);
router.get("/me" ,auth ,status)
router.post("/token" ,reGenerateToken)
router.post('/logout', auth, logoutUser)

// content list 
router.post("/default-files" ,auth, getAllFiles)
router.post("/related-files" ,auth, getRelatedFiles)
router.get("/main-file/:id" ,auth, getMainFile)

// category 
router.get("/category" , auth ,getAllCategories)

// tags
router.get("/tags" , auth ,getLatestTag)

// get filter data 
router.get("/filter-data" ,auth, getFilter)

module.exports = router;
