const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoritesDishesSchema = new Schema({
  dish: {
    type: Schema.Types.ObjectId,
    ref: "Dish",
  },
});

const favoritesSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  dishes: [favoritesDishesSchema],
});

const Favorites = mongoose.model("Favorites", favoritesSchema);
module.exports = Favorites;
