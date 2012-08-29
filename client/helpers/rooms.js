Handlebars.registerHelper('rooms', function() {
	return Rooms.find();
});

Handlebars.registerHelper('is_me', function(mention) {
	return (mention.id === Meteor.user()._id);
});