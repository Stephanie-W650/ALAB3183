const express = require("express");
const bodyParser = require("body-parser");

const users = require("./routes/users");
const posts = require("./routes/posts");

const userData = require("./data/users")
const postData = require("./data/posts")

//const comments = require("./routes/comments")

const error = require("./utilities/error");

const app = express();
const port = 3000;

const comments = []

// Parsing Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

// Logging Middlewaare
app.use((req, res, next) => {
  const time = new Date();

  console.log(
    `-----
${time.toLocaleTimeString()}: Received a ${req.method} request to ${req.url}.`
  );
  if (Object.keys(req.body).length > 0) {
    console.log("Containing the data:");
    console.log(`${JSON.stringify(req.body)}`);
  }
  next();
});

// Valid API Keys.
apiKeys = ["perscholas", "ps-example", "hJAsknw-L198sAJD-l3kasx"];

// New middleware to check for API keys!
// Note that if the key is not verified,
// we do not call next(); this is the end.
// This is why we attached the /api/ prefix
// to our routing at the beginning!
app.use("/api", function (req, res, next) {
  var key = req.query["api-key"];

  // Check for the absence of a key.
  if (!key) next(error(400, "API Key Required"));

  // Check for key validity.
  if (apiKeys.indexOf(key) === -1) next(error(401, "Invalid API Key"));

  // Valid key! Store it in req.key for route access.
  req.key = key;
  next();
});

// Use our Routes
app.use("/api/users", users);
app.use("/api/posts", posts);

// Adding some HATEOAS links.
app.get("/", (req, res) => {
  res.json({
    links: [
      {
        href: "/api",
        rel: "api",
        type: "GET",
      },
    ],
  });
});

// Adding some HATEOAS links.
app.get("/api", (req, res) => {
  res.json({
    links: [
      {
        href: "api/users",
        rel: "users",
        type: "GET",
      },
      {
        href: "api/users",
        rel: "users",
        type: "POST",
      },
      {
        href: "api/posts",
        rel: "posts",
        type: "GET",
      },
      {
        href: "api/posts",
        rel: "posts",
        type: "POST",
      },
    ],
  });
});

//GET /api/users/:id/posts
// http://localhost:3000/api/users/2/posts?api-key=perscholas
app.get("/api/users/:id/posts", (req, res, next) => {
  const userId = req.params.id
  let user = null
  for (let i = 0; i < userData.length; i++) {
    if (userData[i].id == userId) {
      user = userData[i];
      break;
    }
  }
  if (!user) {
    return next(error(404, "Error"))
  }

  const userPost = [];
  for (let j = 0; j < postData.length; j++) {
    if (postData[j].userId == userId) {
      userPost.push(postData[j]);
    }
  }
  res.json({
    user: user,
    posts: userPost,
  })
} )
//GET /api/posts?userId=<VALUE>
//http://localhost:3000/api/posts?userId=1&api-key=perscholas

app.get("/api/posts", (req, res) => {
  const userId = req.query.userId;

  const userPosts = [];
  for (let i = 0; i < postData.length; i++) {
   // if (postData[i].userId == userId) {
      if (postData[i].userId == userId) {
        userPosts.push(postData[i])
      }
    //}
    res.json(userPosts)
  }
})
// GET /comments
//app.use("/comments",)
//const comments = [];
app.get("/comments", (req, res) => {
  res.json(comments)
})


// 404 Middleware
app.use((req, res, next) => {
  next(error(404, "Resource Not Found"));
});

// Error-handling middleware.
// Any call to next() that includes an
// Error() will skip regular middleware and
// only be processed by error-handling middleware.
// This changes our error handling throughout the application,
// but allows us to change the processing of ALL errors
// at once in a single location, which is important for
// scalability and maintainability.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}.`);
});
