import express from "express";
import RestaurantsController from './restaurants.controller.js'
import ReviewsController from './reviews.controller.js'

// Get access to express Router because this is our route file
const router = express.Router()

// the following routes will be added after '/api/v1/restaurants' in server.js
router.route("/").get(RestaurantsController.apiGetRestaurants);
router.route("/id/:id").get(RestaurantsController.apiGetRestaurantById);
router.route("/cuisines").get(RestaurantsController.apiGetRestaurantCuisines);

router.route('/review')
    .post(ReviewsController.apiPostReview)
    .put(ReviewsController.apiUpdateReview)
    .delete(ReviewsController.apiDeleteReview)

export default router;