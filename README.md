## Hip Replacement

A better version of HipChat written in [Meteor](https://github.com/meteor/meteor) and [Bootstrap](http://twitter.github.com/bootstrap/).

### Requirements

* Meteor 0.3.9 ([Auth Branch](https://github.com/meteor/meteor/wiki/Getting-started-with-Auth))

### Getting started

1. `git clone git://github.com/meteor/meteor.git`
2. `cd meteor`
3. `git checkout auth`
4. `export METEOR_HOME=$PWD`
5. `git checkout auth`
6. `cd $HOME`
7. `git clone git://github.com/Jabbslad/hip-replacement.git`
8. `cd hip-replacement`
9. Update `server/secrets.js` with Twitter / Google OAuth secrets
10. Update Twitter / Google OAuth config in `services.js` 
11. `$METEOR_HOME/meteor`
12. Open browser and access [http://localhost:3000]()