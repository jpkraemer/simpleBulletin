
require('tungus');
var fs = require('fs');
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var mustache = require('mustache');
var moment = require('moment');

var mainTemplate = String(fs.readFileSync("index.html"));
mustache.parse(mainTemplate);

var path = __dirname + "/db"; 
console.log(path);
mongoose.connect('tingodb://' + path);

var postSchema = mongoose.Schema( { 
	username: String, 
	email: String, 
	timestamp: { type: Number, default: function () { return moment().unix(); } },
	content: String 
} ); 

postSchema.methods.time = function () { 
	return moment.unix(this.timestamp).format("MMMM, Do YYYY - HH:mm:ss");
};

var Post = mongoose.model('Post', postSchema);

// var newPost = new Post({
// 	username: "Jan-Peter", 
// 	email: "asdasds@asad.co", 
// 	timestamp: moment().unix(),
// 	content: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodoconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
// });

// newPost.save();

var app = express();
app.use('/stylesheets', express.static(__dirname + "/stylesheets")); 
app.use('/images', express.static(__dirname + "/images")); 
app.use('/js', express.static(__dirname + "/js")); 
app.use('/bower_components', express.static(__dirname + "/bower_components")); 

app.use(bodyParser.urlencoded());

var renderPage = function (res, view) {
	if (view === undefined) {
		view = {};
	}
	if (view.error !== undefined) {
		console.log(view.error);
	}
	Post.find(function (err, posts) {
		if (err) { return console.error(err); }
		view.posts = posts; 
		res.send(mustache.render(mainTemplate, view));
	});
};

app.get('/', function(req, res) {
	renderPage(res);
});

app.post('/', function (req, res) {
	var post; 
	var view = {};
	var newPost = req.body.newPost; 
	if (newPost === undefined) {
		view.error = "No Post data"; 
		renderPage(res, view);
		return;
	}

	if (newPost.id === undefined) {
		post = new Post(newPost);

		post.save(function (err) {
			if (err) {
				view.error = err;
			} else {
				view.message = "Posted successfully";
			}
			renderPage(res, view);
		});
	} else {
		console.log(newPost.id);
		Post.find({ _id: newPost.id }, function (err, posts) {
			console.log(posts);
			if (err) { 
				view.error = err; 
				renderPage(res, view);
				return; 
			} 

			if (posts.length !== 1) {
				view.error = "Too many posts found"; 
				renderPage(res, view); 
				return;
			} else {
				post = posts[0];
			}

			if (post.email !== newPost.email) {
				view.error = "Email address verificatin failed";
				renderPage(res, view);
			} else {
				post.content = newPost.content; 

				post.save(function (err) {
					if (err) {
						view.error = err;
					} else {
						view.message = "Updated successfully";
					}
					renderPage(res, view);
				});
			}
		});
	}
});

var server = app.listen(8080, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log("Listening at http://%s:%s", host, port);
});