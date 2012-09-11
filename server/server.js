Meteor.methods({
	add_message: function (args) {
		Messages.insert(args, function() {
			Meteor.users.update({_id:this._userId}, {$set: {seen: new Date()}}, function(err) {
				if (err)
					console.log(err)
			});	
		});
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
		var online = {};
		_.each(_.values(connections), function(connection) {
			return online[connection.user_id] = {online: true, seen: connection.seen};
		});
		return online;
	},
	ping: function() {
		Meteor.users.update({_id:this._userId}, {$set: {seen: new Date()}});
	}
});

// Clear up user statuses with no socket (i.e. Zamma closing his fuggin' laptop lid)
Meteor.setInterval(function() {
	var users = Meteor.users.find({online: true}).fetch();
	_.each(users, function(user) {
		var result = _.any(_.values(connections), function(connection) {
			return connection.user_id === user._id;
		});
		if(!result) {
			Meteor.users.update({_id:user._id}, {$set: {online: false}});
		}
	});
}, 30000);