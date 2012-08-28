Meteor.methods({
	add_message: function (args) {
		Messages.insert(args);
	}
});