const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const adminLayout = "../views/layouts/admin";
const adminLayout2 = "../views/layouts/admin-nologout";
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

/**
 * Check Login
 */
const checkLogin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.redirect("/admin");
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.redirect("/admin");
  }
};

/**
 * GET /logout
 * Admin logout
 */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

/**
 * GET /admin
 * Admin page
 */
router.get("/admin", (req, res) => {
  const locals = {
    title: "관리자 페이지",
  };
  res.render("admin/index", { locals, layout: adminLayout2 });
});

/**
 * POST /admin
 * Admin login
 */
router.post(
  "/admin",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "일치하는 사용자가 없습니다." }); // 몽고DB에 저장된 계정으로 관리자 로그인
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }
    const token = jwt.sign({ id: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/allPosts");
  })
);

/**
 * GET /allPosts
 * Get all posts
 */
router.get(
  "/allPosts",
  checkLogin,
  asyncHandler(async (req, res) => {
    const locals = {
      title: "Posts",
    };
    const data = await Post.find();
    res.render("admin/allPosts", {
      locals,
      data,
      layout: adminLayout,
    });
  })
);

/**
 * GET /add
 * Admin - Add Post
 */
router.get(
  "/add",
  checkLogin,
  asyncHandler(async (req, res) => {
    const locals = { title: "게시물 작성" };
    res.render("admin/add", {
      locals,
      layout: adminLayout,
    });
  })
);

/**
 * POST /add
 * Admin - Add Post
 */
router.post(
  "/add",
  checkLogin,
  asyncHandler(async (req, res) => {
    const { title, body } = req.body;
    const newPost = new Post({
      title: title,
      body: body,
    });
    await Post.create(newPost);
    res.redirect("/allPosts");
  })
);

/**
 * GET /edit/:id
 * Admin - Edit Post
 */
router.get(
  "/edit/:id",
  checkLogin,
  asyncHandler(async (req, res) => {
    const locals = { title: "게시물 편집" };
    const data = await Post.findOne({ _id: req.params.id });
    res.render("admin/edit", {
      locals,
      data,
      layout: adminLayout,
    });
  })
);

/**
 * PUT /edit/:id
 * Admin - Edit Post
 */
router.put(
  "/edit/:id",
  checkLogin,
  asyncHandler(async (req, res) => {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      createdAt: Date.now(),
    });
    res.redirect("/allPosts");
  })
);

/**
 * PUT /edit/:id
 * Admin - Edit Post
 */
router.delete(
  "/delete/:id",
  checkLogin,
  asyncHandler(async (req, res) => {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/allPosts");
  })
);

module.exports = router;
