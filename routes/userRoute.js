const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  changeLoggedUserPassword,
  updateLoggedUserData,
  deactivateLoggedUser,
  activateLoggedUser,
} = require("../services/userService");
const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changePasswordValidator,
  changeLoggedUserPassValidator,
  updateLoggedUserValidator,
  activateLoggedUserValidator,
} = require("../utils/validator/userValidator");

const authService = require("../services/authService");

router.put("/activeMe", activateLoggedUserValidator, activateLoggedUser);

router.use(authService.protect); // allowed for All *

// Allowed for logged users
router.get("/profile", getLoggedUserData, getUser);
router.put(
  "/changeMyPassword",
  changeLoggedUserPassValidator,
  changeLoggedUserPassword
);
router.put("/updateMyData", updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe", deactivateLoggedUser);

// Allowed to admin & manager
router.get(
  "/",

  authService.allowedTo("admin", "manager"),
  getUsers
);

// Allowed to Admin
router.use(authService.allowedTo("admin"));

router.post("/", uploadUserImage, resizeImage, createUserValidator, createUser);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

router.put("/changePassword/:id", changePasswordValidator, changeUserPassword);

module.exports = router;
