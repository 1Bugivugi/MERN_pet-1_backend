import mongodb from "mongodb";
// access to object id; we're going to have to convert a string to a mongodb object
const ObjectId = mongodb.ObjectId;

let reviews;

export default class ReviewsDAO {

    /**
     * Inject DB
     *
     * @param conn
     * @returns {Promise<void>}
     */
    static async injectDB(conn) {
        if (reviews) {
            return
        }

        try {
            reviews = await conn.db(process.env.RESTREVIEWS_NS).collection('reviews')
        } catch (e) {
            console.error(e.message)
        }
    }

    /**
     * Add review
     *
     * @param restaurantId
     * @param user
     * @param review
     * @param date
     * @returns {Promise<{error}|*>}
     */
    static async addReview(restaurantId, user, review, date) {
        try {
            const reviewDoc = {
                name: user.name,
                user_id: user._id,
                date: date,
                text: review,
                restaurant_id: ObjectId(restaurantId)
            }

            return await reviews.insertOne(reviewDoc)
        } catch (e) {
            console.error(e.message)
            return {error: e}
        }
    }

    /**
     * Update single review
     *
     * @param reviewId
     * @param userId
     * @param text
     * @param date
     * @returns {Promise<{error}|*>}
     */
    static async updateReview(reviewId, userId, text, date) {
        try {
            const updateResponse = await reviews.updateOne(
                // looking for a review wth right params
                {user_id: userId, _id: ObjectId(reviewId)},
                {$set: {text: text, date: date}}
            )

            return updateResponse
        } catch (e) {
            console.error(e.message)
            return {error: e}
        }
    }


    /**
     * Delete specific review
     *
     * @param reviewId
     * @param userId
     * @returns {Promise<{error}|*>}
     */
    static async deleteReview(reviewId, userId) {
        try {
            const deleteResponse = await reviews.deleteOne({
                _id: ObjectId(reviewId),
                user_id: userId
            })

            return deleteResponse;
        } catch (e) {
            console.error(e.message)
            return {error: e}
        }
    }
}