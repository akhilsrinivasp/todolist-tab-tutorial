//jshint esversion:6

// const express = require("express");
// const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");

import getDate from "./date.js";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
mongoose.connect(
	"mongodb://localhost:27017/todolistDB",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	}
);

const itemsSchema = {
	name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listsSchema = {
	name: String,
	items: [itemsSchema]
};

const List = mongoose.model("List", listsSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const defaultItems = [
	new Item({ name: "Welcome to your todolist!" }),
	new Item({ name: "Hit the + button to add a new item." }),
	new Item({ name: "<-- Hit this to delete an item." })];

app.get("/", function (req, res) {
	const day = getDate();
	List.findOne({ name: "Home" })
		.then(function (foundList) {
			if (!foundList) {
				const list = new List({
					name: "Home",
					items: defaultItems
				});
				list.save();
				res.redirect("/");
			} else {
				res.render("list", { listTitle: "Home", newListItems: foundList.items });
			}
		}
		);
});

app.post("/", function (req, res) {

	const item = req.body.newItem;
	const listName = req.body.list;

	const newItem = new Item({ name: item });

	List.findOne({ name: listName })
		.then(function (foundList) {
			if (!foundList) {
				const list = new List({
					name: listName,
					items: defaultItems
				});
				list.save();
			}
			else {
				foundList.items.push(newItem);
				foundList.save();
			}
		});
	if(listName === "Home"){ res.redirect("/"); }
	res.redirect("/" + listName);
});

app.post("/delete", function (req, res) {
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;
	
	List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
		.then(function (foundList) {
			console.log("Deleted item from " + listName + " list.");
		})
		.catch(function (err) {
			console.log(err);
		});
	if(listName === "Home"){ res.redirect("/"); }
	else res.redirect("/" + listName);
});

app.get("/about", function (req, res) {
	res.render("about");
});

app.get("/:customListName", function (req, res) {
	List.findOne({ name: req.params.customListName })
		.then(function (foundList) {
			if (!foundList) {
				const list = new List({
					name: req.params.customListName,
					items: defaultItems
				});
				list.save();
				res.redirect("/" + req.params.customListName);
			} else {
				foundList.name = foundList.name.charAt(0).toUpperCase() + foundList.name.slice(1);
				res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
			}
		})
		.catch(function (err) {
			console.log(err);
		});
});

app.listen(3000, function () {
	console.log("Server started.");
	console.log("Access the app at http://localhost:3000");
});
