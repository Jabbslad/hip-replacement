// Client-side JavaScript, bundled and sent to client.

Messages = new Meteor.Collection('messages');

Meteor.autosubscribe(function() {
  Meteor.subscribe('messages', Session.get('current_room'));
});

Meteor.autosubscribe(function() {
  Messages.find().observe({
    added: function(message) {
      if(CLAN_CHAT.notifications)
        notify(message);
    }
  });
})

Rooms = new Meteor.Collection('rooms');
Meteor.autosubscribe(function() {
  Meteor.subscribe('rooms');
});

Participants = new Meteor.Collection('participants');
Meteor.autosubscribe(function() {
  Meteor.subscribe('participants');
});

Meteor.autosubscribe(function() {
  Meteor.subscribe('users');
});

Emotes = new Meteor.Collection('emotes');
Meteor.autosubscribe(function() {
  Meteor.subscribe('emotes');
});


/////////////////// Session Objects //////////////
Session.set('current_room', null);
Session.set('members_panel', false);

////////////////// Namespace Object ////////////////
var CLAN_CHAT = {};
CLAN_CHAT.last_message_poster = null;
CLAN_CHAT.cache = {}
CLAN_CHAT.cache.user = {};
CLAN_CHAT.notifications = false;

Meteor.users.find().observe({
  added: function(user) {
    CLAN_CHAT.cache.user[user._id] = user.name;  
  }
});

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
  return Participants.find({});
};

Template.rooms.webkit_button = function() {
  return window.webkitNotifications && window.webkitNotifications.checkPermission()!==0;
}

Template.rooms.events = {
  'click li#join_room': function() {
    $('#modalJoinRoom').remove();
    var fragment = Meteor.ui.render(function () { 
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
  return Session.get('members_panel');
}

Template.room.events = {
  'keydown textarea': function(e) {
    if(e.keyCode==13 && !e.shiftKey) {
      if(!e.defaultPrevented) {
        mentions.mentionsInput('val', function(text){
          mentions.mentionsInput('getMentions', function(mntns){
            add_message(text, mntns);
          });
        });
      }
      return false;
    }
  },
  'blur textarea':function() {
    CLAN_CHAT.notifications = true;
  },
  'focus textarea':function() {
    CLAN_CHAT.notifications = false;
  },
  'click #leave_room': function() {
    Session.set('current_room', null);
  },
  'click #member_button': function() {
    var member_panel = $('#members_panel');
    console.log(member_panel.is(':visible'))
    if(member_panel.is(':visible')) {
      Session.set('members_panel', false);
    } else {
      Session.set('members_panel', true);
    }
  },
}

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
    var mentions = this.mentions;
    var html = linkify(message.trim());
    _.each(mentions, function(mention) {
      html = html.replace(mention.name, Template.mention({mention: mention}));
    });
    Emotes.find().forEach(function(emote) {
      var regex = new RegExp(emote.code, 'g');
      console.log(regex)
      html = html.replace(regex, emote.imgpath);
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
  Template.room.scroll();
}

Template.mention.pic = function() {
  //console.log(this.mention.id)
  var user = Meteor.users.findOne(this.mention.id)
  console.log(profile_pic(user))
  return profile_pic(user)  
}

Meteor.startup (function() {
  jQuery.event.add(window, "load", Template.room.resize);
  jQuery.event.add(window, "resize", Template.room.resize);
});