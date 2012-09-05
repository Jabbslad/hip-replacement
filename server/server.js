Meteor.methods({
	add_message: function (args) {
		Messages.insert(args);
	},
	more_messages: function(room, offset) {
		var self = this;
		var count = Messages.find({room: room}).count();
		
		var messages = [];
		if(offset <= count) {
			var startIndex = count - 50 - offset;
			var skip  = count > 50 ? (startIndex < 0 ? 0 : startIndex) : 0
			var limit = (count - offset) > 50 ? 50 : (count - offset);
			messages = Messages.find({room: room},{skip: skip, limit: limit}).fetch().reverse();	
		}		
		return messages;
	},
	ooze_on: function() {
		return _.map(_.values(connections), function(connection) {
			return Meteor.users.findOne({_id: connection.user_id})
		});
	}
});