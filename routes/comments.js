const express = require("express");
const router = express.Router();

const comments = []

router.get("/", (req, res) => {
    res.json(comments);
  });
module.exports = router;