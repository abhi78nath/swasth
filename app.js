const dotenv = require("dotenv")
dotenv.config();
const express               = require("express");
const app                   = express();
const ejs                   = require("ejs");
const bodyParser            = require("body-parser");
const mongoose              = require("mongoose");
const session               = require("express-session");
const passport              = require("passport");
const LocalStrategy           = require("passport-local");
const User                    = require("./models/user");

// mongoose.connect("mongodb://localhost/swasth");
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "HireWeb debut version is simple",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser=req.user;
    next();
});

//--------database------------
// mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});


////atlas
const { MongoClient, ServerApiVersion } = require('mongodb');
mongoose.connect(process.env.MONGOMY,{useNewUrlParser:true});
//

const consultSchema=new mongoose.Schema({
    name:String,
    email:String,
    number:Number,
    age:Number,
    gender:String,
    complaint:String
});


const Consult=new mongoose.model("Consult",consultSchema);


app.get("/",function(req,res){
        res.render("index");
  });


app.get("/yoga",function(req,res){
    res.render("yoga");
});

app.get("/disease",function(req,res){
  res.render("disease");
});

app.get("/basic",function(req,res){
    res.render("basicHealth");
})

//====================
//AUTH ROUTES
//====================

//Register Form
app.get("/register",function(req,res){
    res.render("register");
});

//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register")
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/");
        });
    });
});

//Login Form
app.get("/login", function(req, res){
    res.render("login");
});

//handle login logic
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
});

app.get("/logout", (req, res) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      res.redirect("/");
    });
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/consult", isLoggedIn, function(req,res){
    res.render("consult");
});

app.get("/uploadform", isLoggedIn, function(req,res){
    res.render("uploadform")
});

app.get("/lifestyle",function(req,res){
    res.render("lifestyle");
});

app.get("/workout",function(req,res){
    res.render("workout")
});
app.get("/yoga",function(req,res){
    res.render("yoga")
});
app.get("/foods",function(req,res){
    res.render("foods")
});


app.post("/uploadform",function(req, res){
    if(req.files){
        console.log(req.files)
        var file = req.files.file
        var filename = file.name
        console.log(filename)

        file.mv('./uploads/' + filename, function(err){
            if(err) {
                res.send(err)
            } else {
                res.send("File uploaded successfully");
                res.redirect("/");
            }
        })
    }
})


app.post("/consult",function(req,res){
    const consult=new Consult({
     name:req.body.name,
     email:req.body.email,
     number:req.body.number,
     age:req.body.age,
     gender:req.body.gender,
     complaint:req.body.complaint,
    });
    consult.save(function(err){
     if(!err){
       res.redirect("/")
     }
     else{
       res.send(err);
     }
   });
 })


app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000");
});