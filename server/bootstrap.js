Meteor.startup(function () {
	Meteor.users.allow({
	    update: function (userId, docs, fields, modifier) {  
			return true;  
		}  
	});

	Rooms.update({name: 'My Company'}, {name: 'Development'});

	if(Rooms.find().count()===0) {
	  Rooms.insert({name: 'My Company'});
	  Rooms.insert({name: 'Chit chat'});
	}
	if(Emotes.find().count()>0) {
		Emotes.remove({});
	}
	Emotes.insert({code: '\\(all\\)', filename: 'allthethings.png'});
	Emotes.insert({code: '\\(android\\)', filename: 'android.png'});
	Emotes.insert({code: '\\(angry\\)', filename: 'angry.png'});
	Emotes.insert({code: '\\(kiddingme\\)', filename: 'areyoukiddingme.png'});
	Emotes.insert({code: '\\(altassian\\)', filename: 'atlassian.png'});
	Emotes.insert({code: '\\(thanks\\)', filename: 'awthanks.png'});
	Emotes.insert({code: '\\(awyeah\\)', filename: 'awyea.png'});
	Emotes.insert({code: '\\(badass\\)', filename: 'badass.png'});
	Emotes.insert({code: '\\(pokerface\\)', filename: 'badpokerface.png'});
	Emotes.insert({code: '\\(basket\\)', filename: 'basket.png'});
	Emotes.insert({code: '\\(beer\\)', filename: 'beer.png'});
	Emotes.insert({code: ':D', filename: 'bigsmile.png'});
	Emotes.insert({code: '\\(bitbucket\\)', filename: 'bitbucket.png'});
	Emotes.insert({code: '\\(boom\\)', filename: 'boom.gif'});
	Emotes.insert({code: '\\(bumble\\)', filename: 'bumble.png'});
	Emotes.insert({code: '\\(bunny\\)', filename: 'bunny.png'});
	Emotes.insert({code: '\\(creamegg\\)', filename: 'cadbury.png'});
	Emotes.insert({code: '\\(cake\\)', filename: 'cake.png'});
	Emotes.insert({code: '\\(ceilingcat\\)', filename: 'ceilingcat.png'});
	Emotes.insert({code: '\\(cerealguy\\)', filename: 'cerealguy.png'});
	Emotes.insert({code: '\\(challenge\\)', filename: 'challengeaccepted.png'});
	Emotes.insert({code: '\\(chewy\\)', filename: 'chewy.png'});
	Emotes.insert({code: '\\(chocobunny\\)', filename: 'chocobunny.png'});
	Emotes.insert({code: '\\(chompy\\)', filename: 'chompy.gif'});
	Emotes.insert({code: '\\(chucknorris\\)', filename: 'chucknorris.png'});
	Emotes.insert({code: '\\(coffee\\)', filename: 'coffee.png'});
	Emotes.insert({code: '\\(content\\)', filename: 'content.png'});
	Emotes.insert({code: '8\\)', filename: 'cool.png'});
	Emotes.insert({code: '\\(cornelius\\)', filename: 'cornelius.png'});
	Emotes.insert({code: ':\'\\(', filename: 'cry.png'});
	Emotes.insert({code: '\\(dealwithit\\)', filename: 'dealwithit.gif'});
	Emotes.insert({code: '\\(derp\\)', filename: 'derp.png'});
	Emotes.insert({code: '\\(dissaprove\\)', filename: 'disapproval.png'});
	Emotes.insert({code: '\\(drevil\\)', filename: 'drevil.png'});
	Emotes.insert({code: '\\(dumb\\)', filename: 'dumbbitch.png'});
	Emotes.insert({code: ':\\[', filename: 'embarrassed.png'});
	Emotes.insert({code: '\\(facepalm\\)', filename: 'facepalm.png'});
	Emotes.insert({code: '\\(fap\\)', filename: 'fap.png'});
	Emotes.insert({code: '\\(farnsworth\\)', filename: 'farnsworth.png'});
	Emotes.insert({code: '\\(:Q\\)', filename: 'footinmouth.png'});
	Emotes.insert({code: '\\(alone\\)', filename: 'foreveralone.png'});
	Emotes.insert({code: '\\]:\\(', filename: 'frown.png'});
	Emotes.insert({code: '\\(fry\\)', filename: 'fry.png'});
	Emotes.insert({code: '\\(fuckyeah\\)', filename: 'fuckyeah.png'});
	Emotes.insert({code: ':O', filename: 'gasp.png'});
	Emotes.insert({code: '\\(gates\\)', filename: 'gates.png'});
	Emotes.insert({code: '\\(gaytroll\\)', filename: 'gaytroll.gif'});
	Emotes.insert({code: '\\(ghost\\)', filename: 'ghost.png'});
	Emotes.insert({code: '\\(greenbeer\\)', filename: 'greenbeer.png'});
	Emotes.insert({code: '\\(gtfo\\)', filename: 'gtfo.png'});
	Emotes.insert({code: ':\'D', filename: 'happytear.gif'});
	Emotes.insert({code: '\\(<3\\)', filename: 'heart.png'});
	Emotes.insert({code: '\\(hipchat\\)', filename: 'hipchat.png'});
	Emotes.insert({code: '\\(hipster\\)', filename: 'hipster.png'});
	Emotes.insert({code: '\\(lied\\)', filename: 'ilied.png'});
	Emotes.insert({code: '\\(indeed\\)', filename: 'indeed.png'});
	Emotes.insert({code: 'o:\\)', filename: 'innocent.png'});
	Emotes.insert({code: '\\(jackiechan\\)', filename: 'jackie.png'});
	Emotes.insert({code: '\\(jobs\\)', filename: 'jobs.png'});
	Emotes.insert({code: '\\(kermit\\)', filename: 'kermit.gif'});
	Emotes.insert({code: '\\(kiss\\)', filename: 'kiss.png'});
	Emotes.insert({code: '\\(krang\\)', filename: 'krang.gif'});
	Emotes.insert({code: '\\(lol\\)', filename: 'lol.png'});
	Emotes.insert({code: '\\(lolwut\\)', filename: 'lolwut.png'});
	Emotes.insert({code: '\\(megusta\\)', filename: 'megusta.png'});
	Emotes.insert({code: '\\$\\)', filename: 'moneymouth.png'});
	Emotes.insert({code: '\\(ninja\\)', filename: 'ninja.png'});
	Emotes.insert({code: '\\(notbad\\)', filename: 'notbad.png'});
	Emotes.insert({code: '\\(nothingtodo\\)', filename: 'nothingtodohere.png'});
	Emotes.insert({code: '\\(ohcrap\\)', filename: 'ohcrap.png'});
	Emotes.insert({code: '\\(ohgodwhy\\)', filename: 'ohgodwhy.jpeg'});
	Emotes.insert({code: '\\(okay\\)', filename: 'okay.png'});
	Emotes.insert({code: '\\(omg\\)', filename: 'omg.png'});
	Emotes.insert({code: ':K', filename: 'oops.png'});
	Emotes.insert({code: '\\(orly\\)', filename: 'orly.png'});
	Emotes.insert({code: '\\(raptor\\)', filename: 'philosoraptor.png'});
	Emotes.insert({code: '\\(pingpong\\)', filename: 'pingpong.png'});
	Emotes.insert({code: 'P\\)', filename: 'pirate.gif'});
	Emotes.insert({code: '\\(pokerface\\)', filename: 'pokerface.png'});
	Emotes.insert({code: '\\(poo\\)', filename: 'poo.png'});
	Emotes.insert({code: '\\(gift\\)', filename: 'present.png'});
	Emotes.insert({code: '\\(pumpkin\\)', filename: 'pumpkin.png'});
	Emotes.insert({code: '\\(rage\\)', filename: 'rageguy.png'});
	Emotes.insert({code: '\\(reddit\\)', filename: 'reddit.png'});
	Emotes.insert({code: '\\(rudolph\\)', filename: 'rudolph.png'});
	Emotes.insert({code: ':\\(', filename: 'sad.png'});
	Emotes.insert({code: '\\(sadpanda\\)', filename: 'sadpanda.png'});
	Emotes.insert({code: '\\(sadtroll\\)', filename: 'sadtroll.png'});
	Emotes.insert({code: '\\(samjackson\\)', filename: 'samuel.png'});
	Emotes.insert({code: '\\(santa\\)', filename: 'santa.png'});
	Emotes.insert({code: '\\(scumbag\\)', filename: 'scumbag.png'});
	Emotes.insert({code: ':Z', filename: 'sealed.png'});
	Emotes.insert({code: '\\(seomoz\\)', filename: 'seomoz.png'});
	Emotes.insert({code: '\\(shamrock\\)', filename: 'shamrock.png'});
	Emotes.insert({code: '\\(:\\/\\)', filename: 'slant.png'});
	Emotes.insert({code: ':\\)', filename: 'smile.png'});
	Emotes.insert({code: '\\(stare\\)', filename: 'stare.png'});
	Emotes.insert({code: ':\\|', filename: 'straightface.png'});
	Emotes.insert({code: '\\(sweet\\)', filename: 'sweetjesus.png'});
	Emotes.insert({code: '\\(tea\\)', filename: 'tea.png'});
	Emotes.insert({code: '\\(no\\)', filename: 'thumbs_down.png'});
	Emotes.insert({code: '\\(yes\\)', filename: 'thumbs_up.png'});
	Emotes.insert({code: ':P', filename: 'tongue.png'});
	Emotes.insert({code: '\\(tree\\)', filename: 'tree.png'});
	Emotes.insert({code: '\\(troll\\)', filename: 'troll.png'});
	Emotes.insert({code: '\\(true\\)', filename: 'truestory.png'});
	Emotes.insert({code: '\\(turkey\\)', filename: 'turkey.png'});
	Emotes.insert({code: '\\(wat\\)', filename: 'wat.png'});
	Emotes.insert({code: ';\\)', filename: 'wink.png'});
	Emotes.insert({code: ';P', filename: 'winktongue.gif'});
	Emotes.insert({code: '\\(wtf\\)', filename: 'wtf.png'});
	Emotes.insert({code: '\\(yey\\)', filename: 'yey.png'});
	Emotes.insert({code: '\\(yodawg\\)', filename: 'yodawg.png'});
	Emotes.insert({code: '\\(yuno\\)', filename: 'yuno.png'});
	Emotes.insert({code: '\\(zoidberg\\)', filename: 'zoidberg.png'});
	Emotes.insert({code: '\\(zzz\\)', filename: 'zzz.gif'});

	var sockjs = __meteor_bootstrap__.require('sockjs');
	var server = sockjs.createServer({
    	prefix: '/presence', log: function(){},
    	jsessionid: false
    });
    server.installHandlers(__meteor_bootstrap__.app);

    connections = {}
    server.on('connection', function (socket) {
    	connections[socket.id] = socket;

    	socket.write(JSON.stringify({type: 'ooze', data: 'ooze on?'}));

    	socket.on('close', function() {
        	delete connections[socket.id];
        	Fiber(function(id) {
				Meteor.users.update({_id:id}, {$set:{online: false, seen: new Date()}})
			}).run(socket.user_id);
    	});

    	socket.on('data', function(data) {
    		var msg = JSON.parse(data);
    		if(msg.type==='ooze') {
				socket.user_id = msg.data;
				Fiber(function(id) {
					Meteor.users.update({_id:id}, {$set:{online: true, seen: new Date()}})
				}).run(msg.data);	
    		} else if(msg.type==='typing') {
    			_.each(_.values(connections), function(connection) {
					connection.write(JSON.stringify({type: 'typing', data: {userId: socket.user_id, typing: msg.data.typing}}));
				});
    		}
    	});
    });
});