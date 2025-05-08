const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

// Address schema
const addressSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Address name is required'],
        trim: true
    },
    street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        trim: true
    }
});

// Payment method schema
const paymentMethodSchema = new Schema({
    type: {
        type: String,
        required: [true, 'Payment type is required'],
        enum: ['credit_card', 'debit_card', 'paypal'],
        trim: true
    },
    cardName: {
        type: String,
        trim: true
    },
    lastFourDigits: {
        type: String,
        trim: true
    },
    expiryDate: {
        type: String,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
});

const userSchema = new Schema({
    userID: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
        trim: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    addresses: [addressSchema],
    paymentMethods: [paymentMethodSchema],
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, {
    timestamps: true
});

// Fix the arrow function issue - use regular function to maintain 'this' context
userSchema.methods.encryptPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

module.exports = model('User', userSchema);