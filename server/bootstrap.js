Meteor.startup(function () {
	if(Rooms.find().count()===0) {
	  Rooms.insert({name: 'My Company'});
	  Rooms.insert({name: 'Chit chat'})
	}
});