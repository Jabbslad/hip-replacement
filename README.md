## Hip Replacement

A better version of HipChat written in [Meteor](https://github.com/meteor/meteor) and [Bootstrap](http://twitter.github.com/bootstrap/).

### Requirements

* Meteor 0.4.0 ([hip Branch](https://github.com/meteor/meteor/wiki/Getting-started-with-Auth))

### Getting started

1. `git clone git://github.com/Jabbslad/meteor.git`
2. `cd meteor`
3. `git checkout hip`
4. `./install.sh`
5. `cd ..`
6. `git clone git://github.com/Jabbslad/hip-replacement.git`
7. `cd hip-replacement`
8. Update `server/secrets.js` with Twitter / Google OAuth secrets
9. Update Twitter / Google OAuth config in `services.js` 
10. `meteor`
11. Open browser and access [http://localhost:3000]()