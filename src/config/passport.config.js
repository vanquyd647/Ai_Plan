const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const googleConfig = require('./google.config');

// ✅ Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: googleConfig.clientID,
    clientSecret: googleConfig.clientSecret,
    callbackURL: googleConfig.callbackURL,
    scope: googleConfig.scope
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google OAuth Profile received:', {
            id: profile.id,
            displayName: profile.displayName,
            emails: profile.emails,
            photos: profile.photos
        });

        // Get client info (limited in OAuth callback)
        const clientInfo = {
            ip: 'OAuth-Request',
            userAgent: profile._json?.ua || 'Google-OAuth'
        };

        // Use the User model's static method to find or create user
        const user = await User.findOrCreateGoogleUser(profile, clientInfo);

        return done(null, user);
    } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, false);
    }
}));

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Export một function plugin thay vì object passport
function passportPlugin(fastify, options, done) {
    fastify.decorate('passport', passport);
    done();
}

module.exports = (passportPlugin);
