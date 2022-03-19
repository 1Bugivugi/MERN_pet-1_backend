import ReviewsDAO from '../dao/reviewsDAO.js';

export default class ReviewsController {
    static async apiPostReview(req, res, next) {
        try {
            const restaurantId = req.body.restaurant_id;
            const review = req.body.text;
            const userInfo = {
                name: req.body.name,
                _id: req.body.user_id
            }
            const date = new Date()

            const reviewResponse = await ReviewsDAO.addReview(
                restaurantId,
                userInfo,
                review,
                date
            )

            res.json({status: 'success'})
        } catch (e) {
            console.error(e.message)
            res.status(500).json({error: e.message})
        }
    }

    static async apiUpdateReview(req, res, next) {
        try {
            const reviewId = req.body.review_id;
            const review = req.body.text;
            const date = new Date()

            const reviewResponse = await ReviewsDAO.updateReview(
                reviewId,
                req.body.user_id,
                review,
                date
            )

            const {error} = reviewResponse;
            if (error) {
                res.status(400).json({error})
            }

            if (reviewResponse.modifiedCount === 0) {
                throw new Error(
                    'unable to update review - user may not be original poster'
                )
            }

            res.json({status: 'success'})
        } catch (e) {
            console.error(e.message)
            res.status(500).json({error: e.message})
        }
    }

    static async apiDeleteReview(req, res, next) {
        try {
            const reviewId = req.query.id;
            // This part is not usually supposed to be here; it's made for simplicity as an auth
            const userId = req.body.user_id;
            console.log(reviewId)
            const reviewResponse = await ReviewsDAO.deleteReview(
                reviewId,
                userId
            )
            res.json({status: 'success'})
        } catch (e) {
            console.error(e.message)
            res.status(500).json({error: e.message})
        }
    }
}