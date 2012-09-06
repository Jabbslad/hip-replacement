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
    CLAN_CHAT.cache.user[user._id] = user.name;
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
Session.set('auto_scroll', true);
Session.set('offset', 50);
Session.set('online', {});
Session.set('typing', {});

socket = new SockJS('/presence');
socket.onmessage = function(data) {
  var msg = JSON.parse(data.data);
  console.log(msg)
  if(msg.type==='ooze') {
    socket.send(JSON.stringify({type: msg.type, data: Meteor.user()._id}));
    Meteor.call('ooze_on', function(err, online) {
      Session.set('online', online);
    });
  } else if(msg.type==='status') {
    var online = {};
    _.extend(online,  Session.get('online'));
    if(msg.data.status.online) {
      online[msg.data.userId] = {online: msg.data.status.online, seen: msg.data.status.online};
      status_notify(Meteor.users.findOne(msg.data.userId).name + ' has come online.');
      add_system_message(Meteor.users.findOne(msg.data.userId).name + ' has come online.');
    } else {
      delete online[msg.data.userId];
      status_notify(Meteor.users.findOne(msg.data.userId).name + ' has gone offline.');
    }
    Session.set('online', online);  
  } else if(msg.type==='typing') {
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
    Messages.insert({room: Session.get('current_room'), user: Meteor.user()._id, text: msg, mentions: _.map(mntns, function(mntn) {  return ({'id': mntn.id, 'name': mntn.name})}), time: (new Date())});   
    mentions.mentionsInput('reset');
    $('textarea#message_text').focus();
  }
}

function scroll() {
  $("#conversation").scrollTop(99999999); 
}

function resizeFrame() {
    var h = $(window).height();
    $("#conversation").css('height', (h - 300));  
    Template.room.scroll();
}

function notify(message) {
  if(window.webkitNotifications.checkPermission()===0) {
    window.webkitNotifications.createNotification(
         null, 
         CLAN_CHAT.cache.user[message.user],
         message.text).show();
  } else {
    window.webkitNotifications.requestPermission();
  }
}

function status_notify(message) {
  if(window.webkitNotifications.checkPermission()===0) {
    window.webkitNotifications.createNotification(
         null, 
         'Member Notification',
         message).show();
  } else {
    window.webkitNotifications.requestPermission();
  }
}

function profile_pic(user) {
  var pic;
  if(user.emails[0] && user.emails[0].email) {
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

Template.participant.online = function() {
  var online = Session.get('online');
  return (online[this._id]) ? online[this._id].online : false
}

Template.participant.events({
  'mouseenter a.participant': function(e) {
    var online = Session.get('online');
    var title = 'Last seen: ' + ((online[this._id]) ? moment(online[this._id].seen).fromNow() : 'n/a');
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

var mentions;
Template.room.mentions = function() {

  Meteor.defer(function() {
    mentions = $('textarea.mention').mentionsInput({
        onDataRequest:function (mode, query, callback) {
          var data = [];

          Meteor.users.find().forEach(function(user) {
            data.push({id: user._id, name: user.name, avatar: profile_pic(user), type: 'contact'}); 
          });

          data = _.filter(data, function(item) { return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 });
          callback.call(this, data);
        }
      });
  });
}

Template.room.resize = function() {
  Meteor.defer(function() {
    resizeFrame(); 
  });
}

Template.room.members_panel = function() {
  if(Meteor.users.findOne(Meteor.user()._id).member_panel) {
    return true;
  } else {
    return false;
  }
}

Template.room.auto_scroll = function() {
  return Session.get('auto_scroll');
}

Template.room.rendered = function() {
  scroll();
}

Template.room.events({
  'keydown textarea': function(e) {
    if(e.keyCode==13 && !e.shiftKey) {
      if(!e.defaultPrevented) {
        mentions.mentionsInput('val', function(text){
          mentions.mentionsInput('getMentions', function(mntns){
            add_message(text, mntns);
            CLAN_CHAT.typing = false;
            socket.send(JSON.stringify({type: 'typing', data: {userId: Meteor.user()._id, typing: CLAN_CHAT.typing}}));
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
    Session.set('current_room', null);
  },
  'click #scroll_toggle': function() {
    Session.set('auto_scroll', (!Session.get('auto_scroll')));
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
    Session.set('current_room', this.room_id);
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
    Session.set('current_room', this.room_id);
    CLAN_CHAT.last_message_poster = null;
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
    text = text.replace(regex, '<img src="img/' + emote.filename + '"/>');
  });

  message.html(text);
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

Template.message.update_last_poster = function() {
  CLAN_CHAT.last_message_poster = this.user;
}

Template.message.show_pic = function() {
  //return CLAN_CHAT.last_message_poster!==this.user;
  return true;
}

Template.message.format = function(message) {
    var html = message.trim();
    Emotes.find().forEach(function(emote) {
      var regex = new RegExp(emote.code, 'g');
      //html = html.replace(regex, '<img src="img/' + emote.filename + '"/>');
    });
    return html;
}

Template.message.username = function() {
    var user = CLAN_CHAT.cache.user[this.user];
    return user;
}

Template.message.pic = function() {
    var user = Meteor.users.findOne(this.user)
    return profile_pic(user);
}

Template.message.scroll = function() {
  if(Session.get('auto_scroll')) {
    Template.room.scroll();
  }
}

Template.mention.pic = function() {
  var user = Meteor.users.findOne(this.mention.id)
  return profile_pic(user)  
}

Meteor.startup (function() {
  jQuery.event.add(window, "load", Template.room.resize);
  jQuery.event.add(window, "resize", Template.room.resize);

  Tinycon.setOptions({
    width: 7,
    height: 9,
    font: '9px arial',
    colour: '#ffffff',
    background: '#FF0000',
    fallback: true
  });
});