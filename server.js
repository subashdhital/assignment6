/*********************************************************************************
* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Subash Dhital Student ID: 12334233 (sdhital1) Date: March 25 2024

GitHub: https://github.com/subashdhital/assign4.git 
Cyclic: https://bright-sock-calf.cyclic.app (not working, Cycli is down)

********************************************************************************/ 

const express = require("express");
const path = require("path");
const data = require("./modules/collegeData.js");
const exphbs = require('express-handlebars');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs' ,
    helpers:
    {
navLink: function(url, options){
    return `<li class="nav-item">
    <a class="nav-link ${url == app.locals.activeRoute ? "active" : "" }"
    href="${url}">${options.fn(this)}</a>
    </li>`;
   },

   equal: function (lvalue, rvalue, options) {
    if (arguments.length < 3)
    throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
    return options.inverse(this);
    } else {
    return options.fn(this);
    }
   }}}));
app.set('view engine', '.hbs');

app.use (express.urlencoded({ extended: true }) );

app.use(express.static("public"));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
   });

  

app.get("/", (req,res) => {
    res.render('home');
});

app.get("/about", (req,res) => {
    res.render('about');
});

app.get("/htmlDemo", (req,res) => {
    res.render('htmlDemo');
});
app.get("/students/add", (req,res) => {
    res.render('addStudent');
});

app.post("/students/add", (req, res)=>{
    // console.log(req.body);
    data.addStudent(req.body)
    .then(() => {
        res.redirect('/students');
    })
    .catch(error => {
        res.status(500).send('Error adding student: ' + error.message);
    });
});


app.get("/students", (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(req.query.course).then((data) => {
            res.render('students', {
                students:data
            })
        }).catch((err) => {
            res.json({ message: "no results" });
        });
    } else {
        data.getAllStudents().then((data) => {
            res.render('students', {
                students: data
            });
            
        }).catch((err) => {
            res.render('students',{
                message: "no results"
            })
            
        });
    }
});

app.get("/student/:studentNum", (req, res) => {
    data.getStudentByNum(req.params.studentNum).then((data) => {
        res.render("student", {
            student:data
        });
    }).catch((err) => {
        res.json({message:"no results"});
    });
});



app.get("/courses", (req,res) => {
    data.getCourses().then((data)=>{
        res.render('courses',{
            courses: data
        })
    });
});

app.get("/course/:courseID",(req, res) =>{
    
    data.getcourseById(req.params.courseID).then((data) => {
        res.render('course',{
            course:data
        });
        
    });
});

app.post("/student/update", (req, res) => {
    console.log(req.body);
    data.updateStudent(req.body);
    res.redirect("/students");
});

app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});


data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

