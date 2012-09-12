// Client-side JavaScript, bundled and sent to client.

/////////////////////// Collections /////////////////////////

Messages = new Meteor.Collection('messages');
Rooms = new Meteor.Collection('rooms');
Participants = new Meteor.Collection('participants');
Emotes = new Meteor.Collection('emotes');

/////////////////////// Subscriptions /////////////////////////

Meteor.autosubscribe(function() {
  Meteor.subscribe('rooms');
});

Meteor.autosubscribe(function() {
  Meteor.subscribe('participants');
});

Meteor.autosubscribe(function() {
  Meteor.subscribe('users');
});

Meteor.autosubscribe(function() {
  Meteor.subscribe('emotes');
});

Meteor.autosubscribe(function() {
  Meteor.subscribe('messages', Session.get('current_room'));
});

Meteor.autosubscribe(function() {
  Messages.find().observe({
    added: function(message) {
      if(CLAN_CHAT.notifications) {
        if(window.webkitNotifications) {
          notify(message);
        }
        CLAN_CHAT.unseen = ++CLAN_CHAT.unseen;
        Tinycon.setBubble(CLAN_CHAT.unseen);
      }
    }
  });
});

Meteor.users.find().observe({
  added: function(user) {
    if(user._id===Meteor.user()._id)
      socket.send(JSON.stringify({type: 'ooze', data: Meteor.user()._id}));
    CLAN_CHAT.cache.user[user._id] = user;
  },
  changed: function(new_user, index, old_user) {
    if(old_user.online !== new_user.online && new_user._id !== Meteor.user()._id)
      status_notify(new_user.name + (new_user.online ? ' has come online' : ' has gone offline'))
  }
});

////////////////// Namespace Object ////////////////

var CLAN_CHAT = {};
CLAN_CHAT.last_message_poster = null;
CLAN_CHAT.cache = {}
CLAN_CHAT.cache.user = {};
CLAN_CHAT.notifications = false;
CLAN_CHAT.unseen = 0;
CLAN_CHAT.infinite = true;
CLAN_CHAT.typing = false;

/////////////////// Session Objects //////////////
Session.set('current_room', null);
Session.set('offset', 50);
Session.set('typing', {});

///////////////// Global Variables ////////////////
var auto_scroll = true;

socket = new SockJS('/presence');
socket.onmessage = function(data) {
  var msg = JSON.parse(data.data);
  if(msg.type==='typing') {
    var typing = {};
    _.extend(typing,  Session.get('typing'));
    if(msg.data.typing) {
      typing[msg.data.userId] = msg.data.typing;
    } else {
      delete typing[msg.data.userId];
    }
    Session.set('typing', typing);  
  }
}

///////////////// Helpers /////////////////////////

var add_message = function(data, mntns) {
  var msg = $('textarea#message_text').val().trim();
  if(msg!=="") {
    var mentions = _.map(mntns, function(mntn) {  
        return {'id': mntn.id, 'name': mntn.name}
    });
    var message = {
      text: msg,
      mentions: mentions,
      room: Session.get('current_room'), 
      user: Meteor.user()._id,
      time: new Date()
    };
    
    Meteor.call('add_message', message, function(err, result) {
      if (err)
        console.log(err);
    });
  }
}

function scroll() {
  if(auto_scroll) {
    $("#conversation").scrollTop(99999999); 
  }
}

function resizeFrame() {
    var h = $(window).height();
    $("#conversation").css('height', (h - 350));  
    Template.room.scroll();
}

function notify(message) {
  if(window.webkitNotifications.checkPermission()===0) {
    var notification = window.webkitNotifications.createNotification(
         null, 
         CLAN_CHAT.cache.user[message.user].name,
         message.text);
    notification.show();
    setTimeout(function() {
      notification.cancel();
    },3000);
  } else {
    window.webkitNotifications.requestPermission();
  }
  pop.play();
}

function status_notify(message) {
  if(window.webkitNotifications.checkPermission()===0) {
    var notification = window.webkitNotifications.createNotification(
         null, 
         'Member Notification',
         message);
    notification.show();
    setTimeout(function() {
      notification.cancel();
    },3000);
  } else {
    window.webkitNotifications.requestPermission();
  }
}

function profile_pic(user) {
  var pic;
  if(user && user.emails[0] && user.emails[0].email) {
    pic = 'http://s.gravatar.com/avatar/' + CryptoJS.MD5(user.emails[0].email) + '?s=32'
  }
  return pic;
}

///////////////// Templates /////////////////////////

///////////////// Rooms //////////////////////////
Template.rooms.rooms = function() {
  return Participants.find({members : Meteor.user()._id});
};

Template.rooms.webkit_button = function() {
  return window.webkitNotifications && window.webkitNotifications.checkPermission()!==0;
}

Template.rooms.events = {
  'click li#join_room': function() {
    $('#modalJoinRoom').remove();
    var fragment = Meteor.render(function () { 
      return Template.join_room();
    });
    $('#room_panel').append(fragment);
  },
  'click li#create_room': function() {
    $('#modalCreateRoom').remove();
    var fragment = Meteor.render(function () { 
      return Template.create_room();
    });
    $('#room_panel').append(fragment);
  },
  'click .webkit_button': function() {
    window.webkitNotifications.requestPermission();
  }
}

Template.join_room.events = {
  'click .btn-primary': function() {
    $('input[type="checkbox"]:checked').each(function() {
      var room_id = $(this).val()
      var room = Participants.findOne({room_id: room_id});
      if(room) {
        Participants.update({room_id: room_id}, {$addToSet : { members : Meteor.user()._id}});
      } else {
        Participants.insert({room_id: room_id, members: [Meteor.user()._id]});
      }
      $('#modalJoinRoom').modal('hide');
    });
  }
}

Template.create_room.events = {
  'click .btn-primary': function() {
    var room_name = $('input[type="text"]').val();
    if(room_name !== "") {
      var existing_room = Rooms.findOne({name: room_name});
      if(existing_room===undefined) {
        Rooms.insert({name: room_name}, function(err, id) {
          if (err) {
            // XXX - Show error message to user
            console.log(err);
            return;
          }
          var join = $('input[type="checkbox"]').is(':checked');
          if(join) {
            Participants.insert({room_id: id, members: [Meteor.user()._id]}, function(err, id) {
              if (err) {
                // XXX - Show error message to user
                console.log(err);
                return;
              }
              $('#modalCreateRoom').modal('hide');
            });
          } else {
            $('#modalCreateRoom').modal('hide');
          }
        });
      }
    }
  }
}

///////////////// Room //////////////////////////
Template.room.current_room = function () {
  var room = Rooms.findOne({_id: Session.get('current_room')});
  return room;
};

Template.room.messages = function() {
  var messages = Messages.find({room: Session.get('current_room')});
  return messages;
}

Template.room.scroll = function() {
  Meteor.defer(function() {
    scroll();
    $('textarea').focus();
  });
}

Template.room.participants = function() {
  var participants = Participants.findOne({room_id: Session.get('current_room')});
  return Meteor.users.find({_id: {$in: participants.members}});
}

function is_away(user) {
  var now = new Date()
  var then = new Date(user.seen);
  if(then===NaN) {
    return false;
  }
  var diff = Math.abs(now - then);
  // idle if > 10 mins
  return (diff / (1000 * 60)) > 10;
}

Template.participant.status = function() {
  return this.online ? (is_away(this) ? 'status_away.png' : 'status.png') : 'status_offline.png'
}

Template.participant.events({
  'mouseenter a.participant': function(e) {
    var title = 'Last active: ' + (this.seen ? moment(this.seen).fromNow() : 'n/a');
    $(e.target).tooltip({title: title});
    $(e.target).tooltip('show');
  },
  'mouseleave a.participant': function(e) {
    $(e.target).tooltip('hide');
  }
});

Template.participant.typing = function() {
  var online = Session.get('typing');
  return online[this._id] === true;
}

var mentions_input;
Template.room.mentions = function() {

  Meteor.defer(function() {
      if(!mentions_input) {
      mentions_input = $('textarea.mention').mentionsInput({
        onDataRequest:function (mode, query, callback) {
          var data = [];

          _.each(CLAN_CHAT.cache.user, function(user) {
            data.push({id: user._id, name: user.name, avatar: profile_pic(user), type: 'contact'}); 
          });

          data = _.filter(data, function(item) { return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 });
          callback.call(this, data);
        }
      });
      }
  });
}

Template.room.members_panel = function() {
  return Meteor.users.findOne(Meteor.user()._id).member_panel
}

Template.room.auto_scroll = function() {
  return auto_scroll;
}

Template.room.rendered = function() {
  resizeFrame();
  scroll();
}

Template.room.events({
  'keydown textarea': function(e) {
    if(e.keyCode==13 && !e.shiftKey) {
      if(!e.defaultPrevented) {
        mentions_input.mentionsInput('val', function(text){
          mentions_input.mentionsInput('getMentions', function(mntns){
            add_message(text, mntns);
          });
        });
      }
      return false;
    }
  },
  'keyup textarea': function(e) {
    var text = $('#message_text').val();
    if (!CLAN_CHAT.typing && text.length > 0) {
      CLAN_CHAT.typing = true;
      socket.send(JSON.stringify({type: 'typing', data: {userId: Meteor.user()._id, typing: CLAN_CHAT.typing}}));
    } else if (CLAN_CHAT.typing && text.length === 0) {
      CLAN_CHAT.typing = false;
      socket.send(JSON.stringify({type: 'typing', data: {userId: Meteor.user()._id, typing: CLAN_CHAT.typing}}));
    }
  },
  'blur textarea':function() {
    CLAN_CHAT.notifications = true;
  },
  'focus textarea':function() {
    CLAN_CHAT.notifications = false;
    Tinycon.setBubble(0);
    CLAN_CHAT.unseen = 0;
  },
  'click #leave_room': function() {
    Participants.update({room_id : Session.get('current_room')}, {$pull : { members : Meteor.user()._id}});
    Router.setRoom(null);
  },
  'click #scroll_toggle': function() {
    auto_scroll = (!auto_scroll);
    if(auto_scroll) {
      $('a#scroll_toggle').attr('class','btn btn-inverse');
      $('a#scroll_toggle i:first-child').attr('class','icon-refresh icon-white');
    } else {
      $('a#scroll_toggle').attr('class','btn');
      $('a#scroll_toggle i:first-child').attr('class','icon-refresh');
    }
  },
  'click #member_button': function() {
    var member_panel = $('#members_panel');
    if(member_panel.is(':visible')) {
      Meteor.users.update({_id:Meteor.user()._id}, {$set:{member_panel: false}})
    } else {
      Meteor.users.update({_id:Meteor.user()._id}, {$set:{member_panel: true}})
    }
  },
  'scroll #conversation': function(event) {
    if(CLAN_CHAT.infinite && $(event.target).scrollTop() < 1000) {
      CLAN_CHAT.infinite = false;
      var last = $('#conversation .message').last();
      var height = last.offset().top + last.height();
      var offset = Session.get('offset');
      Meteor.call('more_messages', Session.get('current_room'), offset, function(error, result) {
        if(result.length > 0) {
          _.each(result, function(message) {
            $('#conversation').prepend(Template.message(message));
          });
          Session.set('offset', offset + 50);
          var newheight = last.offset().top + last.height();
          $('#conversation').scrollTop((newheight - height) + 1000);
          CLAN_CHAT.infinite = true;
        }      
      });  
    }
  }
});

///////////////// Room Item //////////////////////////
Template.room_item.is_current = function() {
  if(!Session.get('current_room')) {
    Router.setRoom(this.room_id);
  }
  return (Session.get('current_room')===this.room_id);  
}

Template.room_item.count = function() {
  return 0; 
}

Template.room_item.room_name = function() {
  var room = Rooms.findOne(this.room_id);
  return room.name; 
}

Template.room_item.events = {
  'click': function() {
    Router.setRoom(this.room_id);
  }
}

///////////////// Messages //////////////////////////

///////////////// Message ////////////////////////// 

Template.message.rendered = function() {
  var element = this.find('.message_text');
  var message = $(element);
  var text = $(message).text();
  text = linkify(text);

  var mentions = this.data.mentions;
    _.each(mentions, function(mention) {
      text = text.replace(mention.name, Template.mention({mention: mention}));
  });

  Emotes.find().forEach(function(emote) {
    var regex = new RegExp(emote.code, 'g');
    text = text.replace(regex, '<img src="/img/' + emote.filename + '"/>');
  });

  message.html(text);
}

Template.message.online = function() {
  var user = Meteor.users.findOne(this.user)
  return this.user ? user.online : false;
}

Template.message.format_time = function() {
  var date = new Date();
  if(_.isString(this.time)) {
    date = new Date(this.time);
  }
  var hours = date.getHours();
  var mins = date.getMinutes()
  var time = ((hours > 9) ? hours : '0' + hours) + ':' + ((mins > 9) ? mins : '0' + mins)
  return (((hours > 9) ? hours : '0' + hours) + ':' + ((mins > 9) ? mins : '0' + mins));
}

Template.message.username = function() {
    var user = CLAN_CHAT.cache.user[this.user];
    return user.name;
}

Template.message.pic = function() {
    var user = Meteor.users.findOne(this.user)
    return profile_pic(user);
}

Template.mention.pic = function() {
  var user = Meteor.users.findOne(this.mention.id)
  return profile_pic(user)  
}

var ChannelRouter = Backbone.Router.extend({
  routes: {
    'room/:channel_id': 'main'
  },
  main: function(channel_id) {
    CLAN_CHAT.notifications = false;
    Session.set('current_room', channel_id);
    CLAN_CHAT.last_message_poster = null;
  },
  setRoom: function(channel_id) {
    this.navigate('room/' + channel_id, true);
    Meteor.call('ping', function(err) {
      if (err)
        console.log('failed to ping');
    });
  }
});

Meteor.methods({
  ping: function() {
    // nowt
  },
  add_message: function(message) {
    CLAN_CHAT.typing = false;
    socket.send(JSON.stringify({type: 'typing', data: {userId: Meteor.user()._id, typing: CLAN_CHAT.typing}}));
    Messages.insert(message);
    mentions_input.mentionsInput('reset');
  }
});

Router = new ChannelRouter;

var pop = new buzz.sound( "/snd/pop", {
  formats: ["mp3", "wav"]
});

Meteor.startup (function() {
  Backbone.history.start({pushState: true});

  jQuery.event.add(window, "resize", resizeFrame);

  Tinycon.setOptions({
    width: 7,
    height: 9,
    font: '9px arial',
    colour: '#ffffff',
    background: '#FF0000',
    fallback: true
  });
});