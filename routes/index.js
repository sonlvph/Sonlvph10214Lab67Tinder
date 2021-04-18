var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer')

var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var uri_mongoose = "mongodb+srv://sonle:sonle@cluster0.8jpds.mongodb.net/data?retryWrites=true&w=majority";

router.use(bodyParser.json());       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
mongoose.connect(uri_mongoose, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});

let baseJson={
    errorCode: undefined,
    data: undefined,
    errorMessage: undefined,
}


var userSchema = new mongoose.Schema({
    name: String,
    birthday: String,
    gender: String,
    phone: String,
    email: String,
    address: String,
    avatar: String,
    password: String,
});

var userModel = db.model('users', userSchema);

var storage = multer.diskStorage({
    destination:function (req, file, cb) {
        cb(null,'public/uploads/photos/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname +'-'+ file.originalname);
    }
})
var upload = multer({
    dest: 'public/uploads/photos/',
    storage: storage,
    fileFilter:(req, file, cb) => {
        if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .jpg and .jpeg, .png format allowed!'));
        }
    }
}).single('avatar');


// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//
//         cb(null, './public/data/uploads/photos/')
//     },
//     filename: function (req, file, cb) {
//         // const uniqueSuffix = Date.now() +'-'+Math.round(Math.random()*1E9)
//         // cb(null, file.fieldname + '-' + uniqueSuffix)
//         cb(null, file.fieldname +'-'+ file.originalname);
//     }
// });


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/sign_in', function (req, res, next) {
    res.render('sign_in');
});

/*--sign_up--*/
router.post('/sign_up', upload, function (req, res) {

    var userModel = db.model('users', userSchema);

    userModel({
        name: req.body.name,
        birthday: req.body.birthday,
        gender: req.body.gender,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        avatar: 'chibi1.jpg',
        password: req.body.password,
    }).save(function (error) {
        if (error){
            res.render('sign_up',{message:'registration failed!', color:'#ff0000'});
        }else {
            res.render('sign_up',{message:'Sign up successfully!', color:'#2fcd03'});
        }
    });


});

router.get('/sign_up', function (req, res, next) {
    res.render('sign_up');
});

router.get('/add_user', function (req, res, next) {
    res.render('add_user',{layout: 'main_home'});
});
router.post('/add_user', upload, function (req, res) {
    var userModel = db.model('users', userSchema);

    userModel({
        name: req.body.name,
        birthday: req.body.birthday,
        gender: req.body.gender,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        avatar: 'chibi1.jpg',
        password: req.body.password,
    }).save(function (error) {
        if (error){
            res.render('add_user',{layout:'main_home',message:'Add user failed!', color:'#fc0303'});
        }else {
            res.render('add_user',{layout:'main_home',message:'Add user successfully!', color:'#2fcd03'});
        }
    });


});


router.get('/profile', function (req, res, next) {
    res.render('profile', {layout: 'main_home'});
});

router.get('/home',upload, function (req, res, next) {
    var userModel = db.model('users', userSchema);

    userModel.find({},function (error,userList) {
         if (!error){
             res.render('user_list',{layout: 'main_home', users: userList});
         }else {
             res.render('user_list',{layout: 'main_home', message:error.message});
         }
    });
});

router.get('/get_user',upload, function (req, res, next) {
    var userModel = db.model('users', userSchema);

    userModel.find({},function (error,userList) {
        if (error){
            baseJson.errorCode = 400;
            baseJson.data = [];
            baseJson.errorMessage='ERROR: '+error;
            res.send('ERROR: '+error.message);
        }else {
            baseJson.errorCode = 200;
            baseJson.data = userList;
            res.send(baseJson);
        }
    });
});

router.get('/messenger', function (req, res, next) {
    var userModel = db.model('users', userSchema);


    userModel.find({},function (error,userList) {
        if (!error){
            res.render('messenger',{layout: 'main_home', users: userList});
        }else {
            res.render('messenger', {layout: 'main_home'});
        }
    });
});
router.get('/user.id=:id', function (req, res, next) {
    var userModel = db.model('users', userSchema);

    userModel.findById(req.params.id,function (error,user) {
        if (!error){

            res.render('info',{layout:'main_home', user: user, gender:user.gender});
        }else {
            res.send('ERROR: '+error.message);
        }
    });
});

router.post('/user.id=:id',upload, function (req, res, next) {
    var userModel = db.model('users', userSchema);

    var newInfo = {
        name: req.body.name,
        birthday: req.body.birthday,
        gender: req.body.gender,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        password: req.body.password,
    }
    userModel.updateOne({_id:req.params.id},newInfo,function (error,user) {
        if (!error){
            userModel.findById(req.params.id,function (error,user) {
                if (!error){

                    res.render('info',{layout:'main_home', user: user, gender:user.gender});
                }else {
                    res.send('ERROR: '+error.message);
                }
            });

       //     res.render('info',{layout:'main_home', user: user, gender:user.gender, message:'Update successfully!'});
        }else {
            res.render('info',{layout:'main_home', user: user, gender:user.gender, message:'ERROR: '+error.message});
        }
    });

});


router.post('/avatar.id=:id',upload, function (req, res, next) {

    var userModel = db.model('users', userSchema);

    userModel.updateOne({_id:req.params.id},{avatar:'avatar-'+req.file.originalname},function (error) {
        if (!error){
            userModel.findById(req.params.id,function (error,user) {
                if (!error){

                    res.render('info',{layout:'main_home', user: user, gender:user.gender});
                }else {
                    res.send('ERROR: '+error.message);
                }
            });

            //     res.render('info',{layout:'main_home', user: user, gender:user.gender, message:'Update successfully!'});
        }else {
            res.render('info',{layout:'main_home', user: user, gender:user.gender, message:'ERROR: '+error.message});
        }
    });

});

router.get('/remove.id=:id', function (req, res, next) {
    var userModel = db.model('users', userSchema);

    userModel.findByIdAndRemove(req.params.id,function (error,user) {
        if (!error){

            userModel.find({},function (error,userList) {
                if (!error){
                    res.render('messenger',{layout: 'main_home', users: userList});
                }else {
                    res.render('messenger', {layout: 'main_home'});
                }
            });
        }else {
            res.send('ERROR: '+error.message);
        }
    });
});

router.get('/search', function (req, res, next) {
    var userModel = db.model('users', userSchema);

    userModel.find({name:req.query.search},function (error,userList) {
        if (!error){
            res.render('user_list',{layout: 'main_home', users: userList, value:req.query.search});
        }else {
            res.render('user_list',{layout: 'main_home', message:error.message});
        }
    });
});


module.exports = router;
