// Client-side JavaScript, bundled and sent to client.

/////////////////// Session Objects //////////////
Session.set('current_room', null);

////////////////// Namespace Object ////////////////
var CLAN_CHAT = {};
CLAN_CHAT.last_message_poster = null;
CLAN_CHAT.cache = {}
CLAN_CHAT.cache.user = {};

Meteor.users.find().observe({
  added: function(user) {
    CLAN_CHAT.cache.user[user._id] = user.name;  
  }
});

///////////////// Helpers /////////////////////////

var add_message = function(data, mntns) {
  var msg = $('textarea#message_text').val().trim();
  if(msg!=="") {
    Messages.insert({room: Session.get('current_room'), user: Meteor.user()._id, text: msg, mentions: _.map(mntns, function(mntn) {return ({'id': mntn.id, 'name': mntn.name})}), time: new Date()});
    mentions.mentionsInput('reset');
    Template.room.scroll();  
  }
}

function scroll() {
  var conversation = $("#conversation");
    if(conversation.length) {
      conversation.scrollTop(conversation[0].scrollHeight);
    } 
}

function resizeFrame() {
    var h = $(window).height();
    $("#conversation").css('height', (h - 300));
    Template.room.scroll();
}

///////////////// Templates /////////////////////////

///////////////// Rooms //////////////////////////
Template.rooms.rooms = function () {
  return Rooms.find({});
};

///////////////// Room //////////////////////////
Template.room.current_room = function () {
  var room = Rooms.findOne(Session.get('current_room'));
  return room;
};

Template.room.messages = function() {
  return Messages.find({room: Session.get('current_room')});
}

Template.room.scroll = function() {
  Meteor.defer(function() {
    scroll();
  });
}

var mentions;
Template.room.mentions = function() {
  Meteor.defer(function() {
    mentions = $('textarea.mention').mentionsInput({
        onDataRequest:function (mode, query, callback) {
          var data = [];

          Users.find().forEach(function(user) {
            data.push({id: user._id, name: user.name, avatar: user.pic, type: 'contact'}); 
          });

          data = _.filter(data, function(item) { return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 });
          callback.call(this, data);
        }
      });
  });
}

Template.room.resize = function() {
  Meteor.defer(function() {
    Meteor.flush();
    resizeFrame(); 
  });
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
  'click #leave_room': function() {
    Session.set('current_room',''); 
  },
  'click #member_button': function() {
    var conversation = $('#conversation')
    var member_panel = $('#members_panel');
    if(member_panel.is(':visible')) {
      member_panel.hide();
      $('#conversation').removeClass('span9');
      $('#conversation').addClass('span12');
    } else {
      $('#conversation').removeClass('span12');
      $('#conversation').addClass('span9');
      member_panel.show(); 
    }
  },
}

///////////////// Room Item //////////////////////////
Template.room_item.is_current = function() {
  if(!Session.get('current_room')) {
    Session.set('current_room', this._id);
  }
  return (Session.get('current_room')===this._id);  
}

Template.room_item.count = function() {
  return Messages.find({room: this._id}).count(); 
}

Template.room_item.events = {
  'click': function() {
    Session.set('current_room', this._id);
    CLAN_CHAT.last_message_poster = null;
  }
}

///////////////// Messages //////////////////////////

///////////////// Message ////////////////////////// 

Template.message.format_time = function() {
  var date = new Date(this.time)
  var hours = date.getHours();
  var mins = date.getMinutes()
  return (((hours > 9) ? hours : '0' + hours) + ':' + ((mins > 9) ? mins : '0' + mins));
}

Template.message.update_last_poster = function() {
  CLAN_CHAT.last_message_poster = this.user;
}

Template.message.show_pic = function() {
  return CLAN_CHAT.last_message_poster!==this.user;
}

Template.message.format = function(message) {
    var mentions = this.mentions;
    var html = linkify(_.escape(message.trim()));
    _.each(mentions, function(mention) {
      html = html.replace(mention.name, Template.mention({mention: mention}));
    });
    return html;
}

Template.message.username = function() {
    return CLAN_CHAT.cache.user[this.user];
}

Template.message.pic = function() {
    var user = Meteor.users.findOne(this.user)
    return user.pic;
}

Meteor.startup (function() {
  jQuery.event.add(window, "load", Template.room.resize);
  jQuery.event.add(window, "resize", Template.room.resize);
});