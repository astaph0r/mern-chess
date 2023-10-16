const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
// Load User model
const User = require("../model/User");

// module.exports = function(passport) {
passport.use(
	new LocalStrategy(
		// { usernameField: "email" },
		async (user, password, done) => {
			try {
				// Match user
				// console.log(`${user}, ${password}`);
				const userProfile = await User.findOne({
					username: user,
				});
				// .then((user) => {
				if (!userProfile) {
					// console.log("hi");
					return done(null, false);
				} else {
					// Match password
					bcrypt.compare(
						password,
						userProfile.password,
						(error, isMatch) => {
							if (error) {
								// console.log(error.message);
								return done(error);
							}
							if (isMatch) {
								return done(null, userProfile);
							} else {
								return done(null, false);
							}
						}
					);
				}
				// });
			} catch (error) {
				// console.log(error);
				return done(error);
			}
		}
	)
);

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
	try {
		const user = await User.findById(id);
		return done(null, user);
	} catch (error) {
		return done(error);
	}
});
// };
