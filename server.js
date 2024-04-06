/*********************************************************************************
* WEB700 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Subash Dhital Student ID: 12334233 (sdhital1) Date: April 5 2024

GitHub: https://github.com/subashdhital/assignment6
Cyclic: https://victorious-cyan-beret.cyclic.app

********************************************************************************/ 
const express = require("express");
const path = require("path");
const data = require("./modules/collegeData.js");
const exphbs = require("express-handlebars");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return `<li class="nav-item">
    <a class="nav-link ${url == app.locals.activeRoute ? "active" : ""}"
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
      },
    },
  })
);
app.set("view engine", ".hbs");

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo");
});
app.get("/students/add", (req, res) => {
  data
    .getCourses()
    .then((courses) => {
      res.render("addStudent", { courses: courses || [] });
    })
    .catch(() => {
      res.render("addStudent", { courses: [] });
    });
});
app.get("/courses/add", (req, res) => {
  res.render("addCourse");
});

app.post("/students/add", (req, res) => {
  // console.log(req.body)
  data
    .addStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((error) => {
      res.status(500).send("Error adding student: " + error.message);
    });
});

app.post("/courses/add", (req, res) => {
  data
    .addCourse(req.body)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((error) => {
      res.status(500).send("Error adding student: " + error.message);
    });
});
app.get("/students", (req, res) => {
  data
    .getAllStudents()
    .then((data) => {
      if (data.length > 0) {
        
        res.render("students", { students: data });
      } else {
        res.render("students", { message: "No results" });
      }
    })
    .catch((error) => {
      res.render("students", { message: "Error retrieving data" });
    });
});
app.get("/courses", (req, res) => {
  data
    .getCourses()
    .then((data) => {
      if (data.length > 0) {
        res.render("courses", { courses: data });
      } else {
        res.render("courses", { message: "No results" });
      }
    })
    .catch((error) => {
      res.render("courses", { message: "Error retrieving data" });
    });
});

app.get("/student/:studentNum", (req, res) => {
  let viewData = {};
  data
    .getStudentByNum(req.params.studentNum)
    .then((data) => {
      if (data) {
        viewData.student = data;
      } else {
        viewData.student = null;
      }
    })
    .catch((err) => {
      viewData.student = null;
    })
    .then(data.getCourses)
    .then((data) => {
      viewData.courses = data;
      for (let i = 0; i < viewData.courses.length; i++) {
        if (viewData.courses[i].courseId == viewData.student.course) {
          viewData.courses[i].selected = true;
        }
      }
    })
    .catch((err) => {
      viewData.courses = [];
      
    })
    .then(() => {
      if (viewData.student == null) {
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { viewData: viewData });
      }
    });
});

app.get("/course/:id", (req, res) => {
  const courseId = req.params.id;
  data
    .getcourseById(courseId)
    .then((data) => {
      if (!data) {
        res.status(404).send("Course Not Found");
      } else {
        res.render("course", { course: data });
      }
    })
    .catch((error) => {
      res.render("course", { message: "Error retrieving data" });
    });
});

app.get("/course/delete/:id", (req, res) => {
  const courseId = req.params.id;

  data
    .deleteCourseById(courseId)
    .then(() => {
      res.redirect("/courses");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Course / Course not found");
    });
});

app.get("/students/delete/:studentNum", (req, res) => {
    const studentNum = req.params.studentNum;
  
    data.deleteStudentByNum(studentNum)
      .then(() => {
        res.redirect("/students");
      })
      .catch((error) => {
        res.status(500).send("Unable to Remove Student / " + error.message);
      });
  });

app.post("/student/update", (req, res) => {
  data.updateStudent(req.body);
  res.redirect("/students");
});

app.post("/course/update", (req, res) => {
  data.updateCourse(req.body);
  res.redirect("/courses");
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

data
  .initialize()
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT);
    });
  })
  .catch(function (err) {
    console.log("unable to start server: " + err);
  });
