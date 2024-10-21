const express = require("express");

const router = express.Router();

const authService = require("../services/authService");
const {
  createCashOrder,
  getAllOrders,
  userFilterObject,
  getOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require("../services/orderService");

router.use(authService.protect);

router
  .route("/checkout-session/:cartId")
  .get(authService.allowedTo("user"), checkoutSession);

router.route("/:cartId").post(authService.allowedTo("user"), createCashOrder);

router
  .route("/")
  .get(
    authService.allowedTo("user", "admin", "manager"),
    userFilterObject,
    getAllOrders
  );

router
  .route("/:id")
  .get(
    authService.allowedTo("user", "admin", "manager"),
    userFilterObject,
    getOrder
  );

router
  .route("/:id/paid")
  .put(authService.allowedTo("admin", "manager"), updateOrderToPaid);

router
  .route("/:id/delivered")
  .put(authService.allowedTo("admin", "manager"), updateOrderToDelivered);

module.exports = router;
