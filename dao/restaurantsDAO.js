import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;
// OR
// import {ObjectId} from "mongodb";

// Store ref to our db
let restaurants;

export default class RestaurantsDAO {

    /**
     * How we initially connect to our DB - we call this method as soon as our server starts
     *
     * @param conn
     * @returns {Promise<void>}
     */
    static async injectDB(conn) {
        if (restaurants) {
            return;
        }

        try {
            restaurants = await conn.db(process.env.RESTREVIEWS_NS).collection('restaurants')
        } catch (e) {
            console.error(e.message)
        }
    }

    /**
     * For when we want to get the list of all the restaurants in our db
     */
    static async getRestaurants(
        {
            filters = null,
            page = 0,
            restaurantsPerPage = 20
        } = {}
    ) {
        let query;

        if (filters) {
            if ('name' in filters) {
                // We need to create a search index in mongoAtlas in order for this to work
                query = {$text: {$search: filters['name']}}
            } else if ('cuisine' in filters) {
                // db field
                query = {'cuisine': {$eq: filters['cuisine']}}
            } else if ('zipcode' in filters) {
                // db field
                query = {'address.zipcode': {$eq: filters['zipcode']}}
            }
        }

        let cursor

        try {
            cursor = await restaurants.find(query)
        } catch (e) {
            console.error(e.message)
            return {restaurantsList: [], totalNumRestaurants: 0}
        }

        const displayCursor = cursor.limit(restaurantsPerPage).skip(restaurantsPerPage * page);

        try {
            const restaurantsList = await displayCursor.toArray()
            const totalNumRestaurants = await restaurants.countDocuments(query);

            return {restaurantsList, totalNumRestaurants}
        } catch (e) {
            console.error(e.message)
            return {restaurantsList: [], totalNumRestaurants: 0}
        }
    }

    static async getRestaurantById(id) {
        try {
            // Pipelines help match different collections together
            const pipeline = [
                {
                    $match: {
                        _id: new ObjectId(id)
                    }
                },
                /**
                 * lookup 'some other' items(reviews, in this case) to add to the result
                 *
                 * This is part of the mongodb aggregation pipeline
                 * https://docs.mongodb.com/manual/core/aggregation-pipeline/
                 */
                {
                    $lookup: {
                        from: "reviews",
                        let: {
                            id: "$_id"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$restaurant_id', "$$id"]
                                    }
                                }
                            },
                            {
                                $sort: {
                                    date: -1
                                }
                            }
                        ],
                        as: 'reviews'
                    }
                },
                {
                    $addFields: {
                        reviews: '$reviews'
                    }
                }
            ]

            return await restaurants.aggregate(pipeline).next()
        } catch (e) {
            console.error(e.message)
        }
    }

    static async getCuisines() {
        let cuisines = [];
        try {
            // get all DISTINCT cuisines
            cuisines = await restaurants.distinct("cuisine")
            return cuisines
        } catch (e) {
            console.error(e.message)
            return cuisines
        }
    }
}