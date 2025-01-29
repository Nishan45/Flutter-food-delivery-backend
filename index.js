const mongoToConnect = require('./database')
mongoToConnect()

const compression = require('compression')
const express = require('express')
const app = express()
const port = 3000
const Cors = require('cors')
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose')
const { Category } = require('./Schemas')

app.use(Cors())
app.use(express.json());
app.use(compression({ level: 6, threshold: 0 }))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

var pinGenerator=require('./GeneratePin').generatePin

const MenuItems = require('./Schemas').MenuItems;
const Advertisement = require('./Schemas').Advertisement;
const Carts = require('./Schemas').Carts;
const User = require('./Schemas').User
const Order = require('./Schemas').Order
const Pins = require('./Schemas').Pins


//login and signup with JWT authentication..............................................

async function authenticate_user(username, password) {
  var flag = false;
  try{

    var user=await User.findOne({ "username": username });
    
    if(user!=null){
      
      var match=await bcrypt.compare(password, user.password);
      flag=match
    }
  }
  catch(e){
  }
  
  return flag;
}
function create_access_token(username) {
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1d" })
  return token;
}

app.post("/changePassword/:userId/:password", async (req, res) => {
  const userId=req.params.userId;
  const password=req.params.password;
  try {
    var user=await User.findOne({username:userId});
    if(user!=null){
      try{
      bcrypt.hash(password, 10, function (err, hash) {
        user.password=hash;
        user.save();
        res.sendStatus(200);
      });
    }catch(e){
      res.sendStatus(500);
    }
      
    }
    else{
      res.sendStatus(400);
    }
    

  } catch {
    (e) => res.sendStatus(500);
  }
})

app.post("/signup", async (req, res) => {
  const data = req.body;
  const username = data.username;
  const name = data.name;
  const password = data.password;
  try {
    bcrypt.hash(password, 10, function (err, hash) {
      var obj = { "username": username, "password": hash ,"name":name};
      User.create(obj);
      res.status(200).json({ detail: "User created successfully" });
    });
  } catch (e) {
    res.status(403).json({ detail: "Some error occurred" });
  }
})
app.post("/login", async (req, res) => {
  const data = req.body;
  const username = data.username;
  const password = data.password;
 
  if (await authenticate_user(username, password)) {
    var token = create_access_token(username);
    res.status(200).json({ 'token': token });
  } else
    res.status(400).json({ detail: "Incorrect username or password" });
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; 
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    req.params={
      authorized:false
    }
  }
  else{
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      //console.log(err);
      //return res.status(403).send("Could not verify token");
      req.params={
        authorized:false
      }
    }
    else{
      req.params={
        authorized:true
      }
    }
  });
}
  next()
};

app.get("/auth", authenticateToken, (req, res) => {
  //console.log(req.params);
  if(req.params.authorized) res.status(200).json({detail:"User authorized"})
  else res.status(400).json({detail:"User unauthorized"})
    
});

app.get("/userAlreadyExist/:userId", async (req, res) => {
  
  const username = req.params.userId;
  try{
    const user=await User.find({username:username});
    if(user.length==0){
      res.sendStatus(200);

    }
    else{
      res.sendStatus(500);
    }

  }catch(e){
    res.sendStatus(400);
  }
  
})


//End authentication..............................................




//Create operations start...............................................

app.post("/AddMenuItems", async (req, res) => {
  const data = req.body;
  try {
    await MenuItems.create(data).then(items => { res.sendStatus(200); })
      .catch((e) => res.sendStatus(400))
  } catch {
    (e) => res.sendStatus(500);
  }
})
app.post("/AddCategory", async (req, res) => {
  const data = req.body;
  try {
    await Category.create(data).then(items => { res.sendStatus(200); })
      .catch((e) => res.sendStatus(400))
  } catch {
    (e) => res.sendStatus(500);
  }
})
app.post("/UpdateMenuItems", async (req, res) => {
  const data = req.body;
  
  try {
    var item=await MenuItems.findOne({_id:data._id});
    await item.updateOne(data);
    item.save();
   
    res.sendStatus(200);

  } catch {
    (e) => res.sendStatus(500);
  }
})
app.post("/UpdateMenucat/:cat/:id", async (req, res) => {
  
  
  try {
    var items=await MenuItems.find({category:req.params.cat});
    
    for(var i=0;i<items.length;i++){
      items[i].categoryId=req.params.id;
      items[i].save();
    }
   
    res.sendStatus(200);

  } catch {
    (e) => res.sendStatus(500);
  }
})

app.post("/UpdateOrder", async (req, res) => {
  const data = req.body;
  
  try {
    var item=await Order.findOne({_id:data._id});
    await item.updateOne(data);
    item.save();

    
    if(data.deliveryStatus!='pending'){
      
      let pins=await Pins.findOne({pinId:process.env.PINID});
      pins.pins.delete(item.pin)
      pins.save();
    }
    
   
    res.sendStatus(200);

  } catch {
    (e) => res.sendStatus(500);
  }
})
app.post("/DeleteOrder/:id", async (req, res) => {
  
  const id= req.params.id;
  try {
    await Order.findOneAndDelete({_id:id});
    
    res.sendStatus(200);

  } catch {
    (e) => res.sendStatus(500);
  }
})

app.post("/DeleteMenuItems", async (req, res) => {
  const data = req.body;
  
  
  try {
    await MenuItems.findOneAndDelete({_id:data._id});
    
    res.sendStatus(200);

  } catch {
    (e) => res.sendStatus(500);
  }
})


app.post("/AddAdvertisement", async (req, res) => {
  const data = req.body;
  try {
    await Advertisement.create(data).then(items => { res.sendStatus(200); })
      .catch((e) => res.sendStatus(400))
  } catch {
    (e) => res.sendStatus(500);
  }
})

app.post("/AddToCart", async (req, res) => {
  const data = req.body;
  const duplicate=await Carts.find({userId:data["userId"],itemId:data["itemId"]});
  if(duplicate.length>0) res.sendStatus(409);
  else{
  try {
    await Carts.create(data).then(items => { res.sendStatus(200); })
      .catch((e) => res.sendStatus(400))
  } catch {
    (e) => res.sendStatus(500);
  }
}
})

app.post("/MakeOrder", async (req, res) => {
  let data = req.body;
  
  
  let pin=pinGenerator();
  let pins=await Pins.findOne({pinId:process.env.PINID});
  
  while(pins.pins.get(pin)){
    pin=pinGenerator();
  }
  pins.pins.set(pin,true);
  pins.save()
  data["pin"]=pin;
  for(var ind=0;ind<data["items"].length;ind++){

    var item=data["items"][ind];
    try{
      var menuitem=await MenuItems.findById(item["id"]);
      if(menuitem!=null){
        var quant=(item["platetype"]=="Full"?2*item["quantity"]:item["quantity"]);
        if(quant<=menuitem.stock){
          menuitem.stock-=quant;
          menuitem.save();
         
        }
        else{
          res.sendStatus(400);
          return;
        }

    }

    }catch(e){
      res.sendStatus(400);
      return;
    }
    

  }
  
  
  try {
    await Order.create(data).then(items => { res.sendStatus(200); })
      .catch((e) => res.sendStatus(400))
  } catch {
    (e) => res.sendStatus(500);
  }
})

//Create operations end...............................................




//Read operations start...............................................

app.get("/getUserName/:userId", async (req, res) => {
  var user=req.params.userId;
  
  try {
    const data = await User.findOne({username:user});
    res.json(data.name);

  } catch {
    (e) => res.sendStatus(500);
  }
})

app.get("/GetCategory", async (req, res) => {
  
  
  try {
    const data = await Category.find();
    res.json(data);

  } catch {
    (e) => res.sendStatus(500);
  }
})

app.get("/GetPopulerItems", async (req, res) => {
  var date=new Date();
  var prvdate=new Date(date.setMonth(date.getMonth()-1));
  
  try {
    const topselling=await Order.aggregate([
      {
        "$match" : { "createdAt": { "$gte": prvdate } }
      },
      {
        "$unwind": "$items"
      },

      {
        "$group": {
          "_id": "$items.id",
          "Sum": { "$sum": { "$multiply": [ "$items.price", "$items.quantity" ] } },

        }
      },
      {
        "$lookup":{
          "from":"menuitems",
          "localField":"_id",
          "foreignField":"_id",
          "as":"prod",
         
        },
        
      },
      {
        "$unwind":"$prod"
      },
      
      {
        "$sort": {
          "Sum": -1
        }
      },
      {
        "$match":{"prod.stock":{$gt:1}}
      },

      {
        "$limit":10
      },
      {
        "$group":{
          "_id":null,
          "top_sell": {
            "$push": {"id":"$_id"},
          },
        }
      }
      
    ]).then(data=>{
      res.json(data[0]["top_sell"])
      //res.json(data)

    })
    

  } catch {
    (e) => res.sendStatus(500);
  }
})

app.get("/GetAdvertisement", async (req, res) => {
  
  try {
    const data = await Advertisement.find();
    res.json(data);
  } catch {
    (e) => res.sendStatus(500);
  }
})

app.post("/GetMenuitems/:categoryId/:time/:veg/:timezone/:sortby", async (req, res) => {
  const category = req.params.categoryId;
  const time = req.params.time;
  const timezone = req.params.timezone;
  const veg = req.params.veg;
  const sortby=req.params.sortby;
  var body=req.body;
  
  let page = 0;
  let limit = 10;
  if (req.query.page) {
    page = req.query.page;
  }
  if (req.query.limit) {
    limit = req.query.limit;
  }

  try {
    var data =[];
    
    if(limit>0){
      
      if(veg==-1){
        if(sortby=="Populer"){
          data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category,$or:[
            {timezoneStart:{$lte:timezone},timezoneEnd:{$gte:timezone}},
            {timezoneStart:{$lte:timezone},timezoneCompare:true},
            {timezoneEnd:{$gte:timezone},timezoneCompare:true},
    
          ]}).sort({rating:-1}).skip(page * limit).limit(limit);
        }
        else if(sortby=="Special"){
          data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category,$or:[
            {timezoneStart:{$lte:timezone},timezoneEnd:{$gte:timezone}},
            {timezoneStart:{$lte:timezone},timezoneCompare:true},
            {timezoneEnd:{$gte:timezone},timezoneCompare:true},
    
          ],special:true}).skip(page * limit).limit(limit);
        }
        else if(sortby=="Price:Lowtohigh"){
          data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category,$or:[
            {timezoneStart:{$lte:timezone},timezoneEnd:{$gte:timezone}},
            {timezoneStart:{$lte:timezone},timezoneCompare:true},
            {timezoneEnd:{$gte:timezone},timezoneCompare:true},
    
          ]}).sort({price:1}).skip(page * limit).limit(limit);
        }
        else if(sortby=="Price:Hightolow"){
          data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category,$or:[
            {timezoneStart:{$lte:timezone},timezoneEnd:{$gte:timezone}},
            {timezoneStart:{$lte:timezone},timezoneCompare:true},
            {timezoneEnd:{$gte:timezone},timezoneCompare:true},
    
          ]}).sort({price:-1}).skip(page * limit).limit(limit);
        }
        else {
          data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category,$or:[
            {timezoneStart:{$lte:timezone},timezoneEnd:{$gte:timezone}},
            {timezoneStart:{$lte:timezone},timezoneCompare:true},
            {timezoneEnd:{$gte:timezone},timezoneCompare:true},
    
          ]}).skip(page * limit).limit(limit);
        }
        
      }
      else{
        if(sortby=="Populer"){
          data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category,$or:[
            {timezoneStart:{$lte:timezone},timezoneEnd:{$gte:timezone}},
            {timezoneStart:{$lte:timezone},timezoneCompare:true},
            {timezoneEnd:{$gte:timezone},timezoneCompare:true},
    
          ],veg:veg==1?true:false}).sort({rating:-1}).skip(page * limit).limit(limit);
        }
        else if(sortby=="Special"){
          data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category,$or:[
            {timezoneStart:{$lte:timezone},timezoneEnd:{$gte:timezone}},
            {timezoneStart:{$lte:timezone},timezoneCompare:true},
            {timezoneEnd:{$gte:timezone},timezoneCompare:true},
    
          ],special:true,veg:veg==1?true:false}).skip(page * limit).limit(limit);
        }
        else if(sortby=="Price:lowtohigh"){
          data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category,$or:[
            {timezoneStart:{$lte:timezone},timezoneEnd:{$gte:timezone}},
            {timezoneStart:{$lte:timezone},timezoneCompare:true},
            {timezoneEnd:{$gte:timezone},timezoneCompare:true},
    
          ],veg:veg==1?true:false}).sort({price:1}).skip(page * limit).limit(limit);
        }
        else if(sortby=="Price:Hightolow"){
          data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category,$or:[
            {timezoneStart:{$lte:timezone},timezoneEnd:{$gte:timezone}},
            {timezoneStart:{$lte:timezone},timezoneCompare:true},
            {timezoneEnd:{$gte:timezone},timezoneCompare:true},
    
          ],veg:veg==1?true:false}).sort({price:-1}).skip(page * limit).limit(limit);
        }
        else {
          data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category,$or:[
            {timezoneStart:{$lte:timezone},timezoneEnd:{$gte:timezone}},
            {timezoneStart:{$lte:timezone},timezoneCompare:true},
            {timezoneEnd:{$gte:timezone},timezoneCompare:true},
    
          ],veg:veg==1?true:false}).skip(page * limit).limit(limit);
        }

      }
      
      
    }
    else if(Object.keys(body).length>0){
      
      var key=Object.keys(body)[0];
      var val=Object.values(body)[0];
      if(key=="ID"){
        data=await MenuItems.findById(val);
        data=[data];
      }
      else data=await MenuItems.find({ createdAt: { $lte: time },categoryId: category }).where(key).equals({ $regex: '^' + val, $options: 'i' });

    }
    else{
      data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category }).skip(page * limit);
    }
    res.json(data);
  } catch {
    (e) => res.sendStatus(500);
  }
})

app.post("/GetMenuitemsGreater/:category/:time", async (req, res) => {
  const category = req.params.category;
  const time = req.params.time;
  var body=req.body;
  

  let page = 0;
  let limit = 10;
  if (req.query.page) {
    page = req.query.page;
  }
  if (req.query.limit) {
    limit = req.query.limit;
  }

  try {
    var data =[];
    
    if(limit>0){
      data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category }).skip(page * limit).limit(limit);
    }
    else if(Object.keys(body).length>0){
      
      var key=Object.keys(body)[0];
      var val=Object.values(body)[0];
      //console.log(key)
      data=await MenuItems.find({ createdAt: { $lte: time },categoryId: category }).where(key).equals({ $gte:val});

    }
   
    else{
      data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category }).skip(page * limit);
    }
    res.json(data);
  } catch {
    (e) => res.sendStatus(500);
  }
})

app.post("/SearchMenuitems/:time", async (req, res) => {
  const time = req.params.time;

  var body=req.body;
  
  let page = 0;
  let limit = 10;
  if (req.query.page) {
    page = req.query.page;
  }
  if (req.query.limit) {
    limit = req.query.limit;
  }

  try {
    var data =[];
    data=await MenuItems.find({ createdAt: { $lte: time },name:{$regex:'^.*'+body["name"]+'.*$',$options:'i'}}).skip(page * limit).limit(limit);
    
    res.json(data);
  } catch {
    (e) => res.sendStatus(500);
  }
})

app.get("/GetCarts/:userId", async (req, res) => {
  const userId = req.params.userId;
  let page = 0;
  let limit = 20;
  if (req.query.page) {
    page = req.query.page;
  }
  if (req.query.limit) {
    limit = req.query.limit;
  }
  try {
    const data = await Carts.find({ userId: userId });
    let items = [];
    for (let i = 0; i < data.length; i++) {
      let item = await MenuItems.find({ _id: data[i].itemId });
      if(item.length>0 && item[0]._doc["stock"]>1){
      item[0]._doc['count']=1;
      item[0]._doc['plate']="Full";
      items.push(item);
      }
    }
    res.json(items);
  } catch {
    (e) => res.sendStatus(500);
  }
})

app.get("/GetUserOrders/:userId/:page/:limit", async (req, res) => {
  var userId=req.params.userId;
  var page=req.params.page;
  var limit=req.params.limit;

  var data=[];
  try {
    data=await Order.find({ userId:userId }).sort({createdAt:-1}).skip(page*limit).limit(limit);
    
    res.json(data);
  } catch {
    (e) => res.sendStatus(500);
  }
})


app.post("/GetOrders", async (req, res) => {
  var body=req.body;
  var data=[];
  try {
    if(Object.keys(body).length>0){
      
      var key=Object.keys(body)[0];
      var val=Object.values(body)[0];
      //console.log(key)
      if(key=="OrderId") data=await Order.findById(val);

      else data=await Order.find({ deliveryStatus:"pending" }).sort({createdAt:1}).where(key).equals(val);

    }
   
    else data = await Order.find({ deliveryStatus:"pending" }).sort({createdAt:1});
    
    res.json(data);
  } catch {
    (e) => res.sendStatus(500);
  }
})

app.post("/GetOrderHistory/:page/:limit", async (req, res) => {
  var body=req.body;
  var page=req.params.page;
  var limit=req.params.limit;
  var data=[];
  try {
    if(Object.keys(body).length>0){
      
      var key=Object.keys(body)[0];
      var val=Object.values(body)[0];
      //console.log(key)
      if(key=="OrderId") data=await Order.findById(val);

      else data=await Order.find({ deliveryStatus:{$ne:"pending"} }).skip(page*limit).limit(limit).where(key).equals(val);

    }
   
    else data = await Order.find({ deliveryStatus:{$ne:"pending"} }).skip(page*limit).limit(limit);
    
    res.json(data);
  } catch {
    (e) => res.sendStatus(500);
  }
})

app.get("/GetMenuItemById/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  try {
    const data = await MenuItems.findById(itemId );
    res.json(data);
  } catch {
    (e) => res.sendStatus(500);
  }
})


//Read operations end...............................................

//Delete operations start...............................................

app.get("/DeleteCart/:userId/:itemId", async (req, res) => {
  const userId = req.params.userId;
  const itemId = req.params.itemId;
  //console.log(itemId);
  try{
    await Carts.findOneAndDelete({userId:userId,itemId:itemId}).then(res.sendStatus(200)).catch((e) => res.sendStatus(404));
  }
  catch(e){
    res.sendStatus(504);
  }

})

//Admin start...............................................
app.post("/GetAdminMenuitems/:categoryId/:time", async (req, res) => {
  const category = req.params.categoryId;
  const time = req.params.time;
  var body=req.body;
  
  let page = 0;
  let limit = 10;
  if (req.query.page) {
    page = req.query.page;
  }
  if (req.query.limit) {
    limit = req.query.limit;
  }

  try {
    var data =[];
    
    if(limit>0){
      data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category }).skip(page * limit).limit(limit);
    }
    else if(Object.keys(body).length>0){
      
      var key=Object.keys(body)[0];
      var val=Object.values(body)[0];
      if(key=="ID"){
        data=await MenuItems.findById(val);
        data=[data];
      }
      else data=await MenuItems.find({ createdAt: { $lte: time },categoryId: category }).where(key).equals({ $regex: '^' + val, $options: 'i' });

    }
    else{
      data=await MenuItems.find({ createdAt: { $lte: time }, categoryId: category }).skip(page * limit);
    }
    res.json(data);
  } catch {
    (e) => res.sendStatus(500);
  }
})

//Admin end...............................................


app.post("/test", async (req, res) => {
    
  
    var data = await MenuItems.find();
   
    for (let i = 0; i < data.length; i++) {
      /*
      data[i].veg=false;
      data[i].timezone="20:0-21:00";
      data[i].cooktime=200;
      data[i].deliverytime=200;
      data[i].rating=4;
      data[i].haflprice=200;
      data[i].special=true;
      data[i].description="This is delicious";
      */
      data[i].timezoneStart=0;
      data[i].timezoneEnd=24*60;
      data[i].timezoneCompare=false;
      await data[i].save();
     
    }
   
    res.json("OK");
  
})



