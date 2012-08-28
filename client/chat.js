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
    Meteor.call('add_message', {room: Session.get('current_room'), user: Meteor.user()._id, text: msg, mentions: _.map(mntns, function(mntn) {return ({'id': mntn.id, 'name': mntn.name})}), time: new Date()});   
    mentions.mentionsInput('reset');
    $('textarea#message_text').focus();
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
Template.rooms.rooms = function() {
  return Participants.find({});
};

Template.rooms.events = {
  'click li#join_room': function() {
    $('#modalJoinRoom').remove();
    var fragment = Meteor.ui.render(function () { 
      return Template.join_room();
    });
    $('#room_panel').append(fragment);
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
  var room = Participants.findOne({room_id: Session.get('current_room')});
  return room;
};

Template.room.messages = function() {
  var messages = Messages.find({room: Session.get('current_room')}).fetch();
  var start = (messages.length - 50) < 0 ? 0 : (messages.length - 50);
  return messages.slice(start, messages.length);
}

Template.room.scroll = function() {
  Meteor.defer(function() {
    scroll();
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
    Session.set('current_room', null); 
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
    Session.set('current_room', this.room_id);
  }
  return (Session.get('current_room')===this.room_id);  
}

Template.room_item.count = function() {
  return Messages.find({room: this.room_id}).count(); 
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
  var date = new Date(this.time)
  var hours = date.getHours();
  var mins = date.getMinutes()
  var time = ((hours > 9) ? hours : '0' + hours) + ':' + ((mins > 9) ? mins : '0' + mins)
  if (time === "0NaN:0NaN") {
    return "";
  }
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
    var html = linkify(_.escape(message.trim()));
    _.each(mentions, function(mention) {
      html = html.replace(mention.name, Template.mention({mention: mention}));
    });
    html = html.replace(/\(troll\)/g, '<img src="img/troll.png"/>');
    html = html.replace(/\(tea\)/g, '<img src="img/tea.png"/>');
    return html;
}

Template.message.username = function() {
    return CLAN_CHAT.cache.user[this.user];
}

Template.message.pic = function() {
    var user = Meteor.users.findOne(this.user)
    return user.pic;
}

Template.message.scroll = function() {
  Template.room.scroll();
}

Meteor.startup (function() {
  jQuery.event.add(window, "load", Template.room.resize);
  jQuery.event.add(window, "resize", Template.room.resize);
});