Handlebars.registerHelper('rooms', function() {
	return Rooms.find();
});

Handlebars.registerHelper('is_me', function(mention) {
	return (mention.id === Meteor.user()._id);
});

var cycle = 0;
Handlebars.registerHelper('cycle', function() {
	cycle += 1;
	return (cycle % 2) == 0 ? 'even' : 'odd';
});