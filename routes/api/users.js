const express = require("express");
const router = express.Router();
const userModel = require("../../models/user");
const UserSchema = require("../../services/schemas/userSchema");
const joi = require("../../utils/joi/joi");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const { auth } = require("../../authorization/auth");

router.get("/", auth, async (req, res, next) => {
  try {
    const { email } = req.user;
    res.status(200).json({
      status: 200,
      data: `Authorization was successful: ${email}`,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/users/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { error } = joi.schemaRegistration.validate(req.body);
    const user = await UserSchema.findOne({ email });
    if (user) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email is already in use",
        data: "Conflict",
      });
    }
    if (error) {
      const errorMessage = error.details.map((elem) => elem.message);
      res.status(400).json({ message: errorMessage });
    } else {
      const newUser = new UserSchema({ email, password });
      newUser.setPassword(password);
      await newUser.save();
      const response = {
        user: {
          email: email,
          subscription: "starter",
        },
      };
      res.status(201).json({
        status: 201,
        data: response,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Not found" });
  }
});

router.post("/users/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { error } = joi.schemaRegistration.validate(req.body);
    if (error) {
      const errorMessage = error.details.map((elem) => elem.message);
      return res.status(400).json({
        status: "error",
        code: 400,
        message: errorMessage,
        data: "Conflict",
      });
    }

    const user = await userModel.getUserByEmail(email);
    if (!user || !user.validPassword(password)) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Email or password is wrong",
        data: "Conflict",
      });
    } else {
      const payload = {
        id: user.id,
        email: user.email,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      const response = await userModel.loginUser(user.id, token);
      res.status(200).json({
        status: 200,
        data: response,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Not found" });
  }
});

router.get("/users/logout", auth, async (req, res, next) => {
  try {
    const { id } = req.user;
    const response = await userModel.logoutUser(id);
    res.status(204).json({
      status: 204,
      data: `Logout successful: ${response}`,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/users/current", auth, async (req, res, next) => {
  try {
    const { id } = req.user;
    const response = await userModel.getUserById(id);
    res.status(200).json({
      status: 200,
      email: response.email,
      subscription: response.subscription,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
