const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    callbackURL: "https://booking-websites-copy.onrender.com/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.id}@google.com`;
      let user = await User.findOne({ email });
      
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: email,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
          provider: 'google',
          providerId: profile.id
        });
        await user.save();
      } else if (user.provider === 'local') {
        user.provider = 'google';
        user.providerId = profile.id;
        if (!user.avatar && profile.photos && profile.photos.length > 0) user.avatar = profile.photos[0].value;
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
    callbackURL: "https://booking-websites-copy.onrender.com/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'photos']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Facebook might not provide an email sometimes if unverified
      let email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.id}@facebook.com`;
      let user = await User.findOne({ email });
      
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: email,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
          provider: 'facebook',
          providerId: profile.id
        });
        await user.save();
      } else if (user.provider === 'local') {
        user.provider = 'facebook';
        user.providerId = profile.id;
        if (!user.avatar && profile.photos && profile.photos.length > 0) user.avatar = profile.photos[0].value;
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
