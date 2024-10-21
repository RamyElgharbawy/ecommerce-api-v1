const express = require("express");
const {
  addAddressToUserAddressesList,
  getLoggedUserAddressList,
  removeAddressFromUserAddressesList,
} = require("../services/addressService");

const router = express.Router();

const authService = require("../services/authService");
const {
  addAddressValidator,
} = require("../utils/validator/addressesValidator");

router.use(authService.protect, authService.allowedTo("user"));

router
  .route("/")
  .post(addAddressValidator, addAddressToUserAddressesList)
  .get(getLoggedUserAddressList);

router.delete("/:addressId", removeAddressFromUserAddressesList);

module.exports = router;
