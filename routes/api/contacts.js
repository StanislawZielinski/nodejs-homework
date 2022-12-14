const express = require("express");
const router = express.Router();
const contacts = require("../../models/contacts");
const joi = require("../../utils/joi/joi");
const { auth } = require("../../authorization/auth");

router.get("/", auth, pagination(), async (req, res, next) => {
  try {
    res.status(200).json({
      status: 200,
      totalInDatabase: res.totalInDatabase,
      data: res.response,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:contactId", auth, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const response = await contacts.getContactById(contactId);
    if (response) {
      res.status(200).json({
        status: 200,
        data: response,
      });
    } else {
      res.status(404).json({ message: "User not exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Not found" });
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const { id } = req.user;
    console.log(id);
    const body = req.body;
    const { error } = joi.schemaPost.validate(body);
    if (error) {
      const errorMessage = error.details.map((elem) => elem.message);
      res.status(400).json({ message: errorMessage });
    } else {
      const response = await contacts.addContact(id, body);
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

router.put("/:contactId", auth, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contactFile = await contacts.getContactById(contactId);
    const body = req.body;
    const result = joi.schemaPut.validate(body);
    const { error } = result;
    if (contactFile) {
      if (!error) {
        const response = await contacts.updateContact(contactId, body);
        res.status(200).json({
          status: 200,
          message: response,
        });
      } else {
        const errorMessage = error.details.map((elem) => elem.message);
        res.status(400).json({ message: errorMessage });
      }
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Not found" });
  }
});

router.delete("/:contactId", auth, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contactFile = await contacts.getContactById(contactId);
    if (contactFile) {
      await contacts.removeContact(contactId);
      res.status(200).json({
        status: 200,
        message: "contact deleted",
      });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Not found" });
  }
});

router.patch("/:contactId/favorite", auth, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contactFile = await contacts.getContactById(contactId);
    const body = req.body;
    const result = joi.schemaFavorite.validate(body);
    const { error } = result;
    if (contactFile && !error) {
      const response = await contacts.updateStatusContact(contactId, body);
      res.status(200).json({
        status: 200,
        message: response,
      });
    } else {
      const errorMessage = error.details.map((elem) => elem.message);
      res.status(400).json({ message: errorMessage });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Not found" });
  }
});

function pagination() {
  return async (req, res, next) => {
    const { id } = req.user;
    const page = req.query.page;
    const limit = req.query.limit;
    const favorite = req.query.favorite;
    try {
      const totalInDatabase = (await contacts.listContacts(id)).length;
      res.totalInDatabase = totalInDatabase;

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      let response;
      const { error } = joi.schemaPageAndLimitAndFavorite.validate({
        page: page,
        limit: limit,
        favorite: favorite,
      });
      if (error) {
        const errorMessage = error.details.map((elem) => elem.message);
        res.status(400).json({ message: errorMessage });
      } else {
        if (totalInDatabase < endIndex) {
          response = "No contacts";
        } else {
          if (favorite === undefined) {
            response = await contacts.getLimitedContacts(id, limit, startIndex);
          } else {
            response = await contacts.getLimitedContactsWithFavorite(
              id,
              limit,
              startIndex,
              favorite
            );
          }
        }
      }
      res.response = response;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}

module.exports = router;
