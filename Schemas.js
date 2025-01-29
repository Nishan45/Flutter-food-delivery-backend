const mongoose=require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
},{timestamps:true});

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    }
},{timestamps:true});




const MenuItemsSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxLength:25
    },
    price:{
        type:Number,
        required:true,
    },
    halfprice:{
        type:Number
    },
    stock:{
        type:Number,
        required:true,
    },
    image:{
        type:String,
    },
    category:{type:String},
    categoryId:{type:mongoose.SchemaTypes.ObjectId,required:true},
    veg:{
        type:Boolean
    },
    rating:{
        type:Number
    },
    description:{
        type:String
    },
    cooktime:{
        type:Number
    },
    deliverytime:{
        type:Number
    },
    special:{
        type:Boolean
    },
    timezone:{
        type:String
    },
    timezoneStart:{
        type:Number
    },
    timezoneEnd:{
        type:Number
    },
    timezoneCompare:{
        type:Boolean
    },
    


},{timestamps:true});

const AdvertisementSchema=new mongoose.Schema({
    image:{
        type:String,
        required:true
    },

},{timestamps:true});

const CartSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    itemId:{
        type:String,
        required:true
    },

},{timestamps:true});
const MenuItems=mongoose.model("MenuItems",MenuItemsSchema);


const OrderSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    items:[
        {
            
            id:{type:mongoose.SchemaTypes.ObjectId,required:true},
            image:{type:String,required:true},
            name:{type:String,required:true},
            quantity:{type:Number,required:true},
            platetype:{type:String,required:true},
            price:{type:Number,required:true},
            _id:false
              
        }
    ],
   
    deliveryStatus:{
        type:String,
        default:"pending"
    },
    paymentStatus:{
        type:String,
    },
    paymentMode:{
        type:String,
    },

    totalPrice:{
        type:Number,
        required:true
    },
    pin:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },

},{timestamps:true});

const PinsSchema=new mongoose.Schema({
    pinId:{
        type:String,
    },
    pins:{
        type:Map,
        
    }
},{timestamps:true});


const User = mongoose.model('user', userSchema)
const Category = mongoose.model('category', categorySchema)

//const MenuItems=mongoose.model("MenuItems",MenuItemsSchema);
const Advertisement=mongoose.model("advertisement",AdvertisementSchema);
const Carts=mongoose.model("carts",CartSchema);
const Order=mongoose.model("order",OrderSchema);
const Pins=mongoose.model("pins",PinsSchema);

//OrderSchema.path('item').ref('MenuItems');

module.exports={
    User,
    Category,
    MenuItems,
    Advertisement,
    Carts,
    Order,
    Pins
};