var mongoose = require('mongoose');

var shoppingSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    dishType: String,
    banner: String,
    dishItems: [
        {
            itemNo: Number,
            itemName: String,
            itemShortDescription: String,
            itemPrice: Number,
            itemExtraOptionsizes: {
                itemPlaceholderName: String,
                sizes: [
                    {
                        id: Number,
                        name: String,
                        amount: Number
                    }
                ]
            },
            itemExtraOptionPrice: {
                itemPlaceholderName: String,
                prices: [
                    {
                        id: Number,
                        name: String,
                        amount: Number
                    }
                ]
            }


        }
    ]
});

module.exports = mongoose.model('shopSchema', shoppingSchema, 'shoppingList');