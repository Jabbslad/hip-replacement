// TODO - Disable Autopublish and put manual publishes in here

Messages = new Meteor.Collection('messages');

Meteor.publish('messages', function (room) {
	var self = this;
	var count = Messages.find({room: room}).count();
	var skip  = count > 50 ? count - 50 : 0
	var messages = Messages.find({room: room},{skip: skip})
	return messages;
});

Rooms = new Meteor.Collection('rooms');
Meteor.publish('rooms', function() {
	return Rooms.find();
});


Participants = new Meteor.Collection('participants');
Meteor.publish('participants', function() {
	return Participants.find();
});

Meteor.publish('users', function() {
	return Meteor.users.find();
});