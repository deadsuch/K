const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT секрет
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

module.exports = function(db) {
  // Настраиваем GitHub стратегию
  passport.use(new GitHubStrategy({
    clientID: 'Ov23lizgwPLHgcagK3hw',
    clientSecret: '1914d36b52d3709300f81f42e99f690daac172af',
    callbackURL: 'http://localhost:5000/api/auth/github/callback'
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Проверяем, существует ли пользователь с таким GitHub ID
      db.get(
        `SELECT * FROM users WHERE github_id = ?`,
        [profile.id],
        async (err, user) => {
          if (err) {
            return done(err);
          }

          // Если пользователь существует, возвращаем его
          if (user) {
            return done(null, user);
          }

          // Если пользователь не существует, создаем нового
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
          const fullName = profile.displayName || profile.username;

          // Проверяем, есть ли пользователь с таким email
          db.get(
            `SELECT * FROM users WHERE email = ?`,
            [email],
            (err, existingUser) => {
              if (err) {
                return done(err);
              }

              if (existingUser) {
                // Если пользователь с таким email уже существует, обновляем его github_id
                db.run(
                  `UPDATE users SET github_id = ? WHERE id = ?`,
                  [profile.id, existingUser.id],
                  function(err) {
                    if (err) {
                      return done(err);
                    }
                    return done(null, { ...existingUser, github_id: profile.id });
                  }
                );
              } else {
                // Создаем нового пользователя
                db.run(
                  `INSERT INTO users (email, full_name, github_id, role, password) VALUES (?, ?, ?, ?, ?)`,
                  [email, fullName, profile.id, 'patient', 'github_oauth_user'],
                  function(err) {
                    if (err) {
                      return done(err);
                    }
                    
                    const newUser = {
                      id: this.lastID,
                      email,
                      full_name: fullName,
                      github_id: profile.id,
                      role: 'patient'
                    };
                    
                    return done(null, newUser);
                  }
                );
              }
            }
          );
        }
      );
    } catch (error) {
      return done(error);
    }
  }));

  // Сериализация и десериализация пользователя
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
      done(err, user);
    });
  });

  // Маршрут для инициирования аутентификации через GitHub
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

  // Маршрут обратного вызова для GitHub
  router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login', session: false }),
    (req, res) => {
      // Создаем JWT токен
      const token = jwt.sign(
        {
          userId: req.user.id,
          email: req.user.email,
          role: req.user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Редиректим на клиент с токеном в URL
      res.redirect(`http://localhost:3000/auth-callback?token=${token}&userId=${req.user.id}&role=${req.user.role}`);
    }
  );

  return router;
} 