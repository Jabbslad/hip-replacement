Meteor.startup(function () {
	if(Rooms.find().count()===0) {
	  Rooms.insert({name: 'My Company'});
	  Rooms.insert({name: 'Chit chat'});
	}
	if(Emotes.find().count()>0) {
		Emotes.remove({});
	}
	Emotes.insert({code: '\\(troll\\)', imgpath: '<img src="img/troll.png"/>'});
	Emotes.insert({code: '\\(tea\\)', imgpath: '<img src="img/tea.png"/>'});
	Emotes.insert({code: '\\(alone\\)', imgpath: '<img src="img/foreveralone.png"/>'});
	Emotes.insert({code: '\\(norris\\)', imgpath: '<img src="img/chucknorris.png"/>'});
	Emotes.insert({code: '\\(turd\\)', imgpath: '<img src="img/poo.png"/>'});
	Emotes.insert({code: '\\(lol\\)', imgpath: '<img src="img/lol.png"/>'});
	Emotes.insert({code: '\\(megusta\\)', imgpath: '<img src="img/megusta.png"/>'});
	Emotes.insert({code: '\\(wtf\\)', imgpath: '<img src="img/wtf.png"/>'});
	Emotes.insert({code: '\\(github|octocat\\)', imgpath: '<img src="img/octocat.png" width="18px" height="18px"/>'});
	Emotes.insert({code: '\\(kermit\\)', imgpath: '<img src="img/kermit.gif"/>'});
	Emotes.insert({code: ':\\)', imgpath: '<img src="img/smile.png"/>'});
	Emotes.insert({code: ':\\(', imgpath: '<img src="img/sad.png"/>'});
});