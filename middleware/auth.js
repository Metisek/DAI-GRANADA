// auth.js
export const isAuthenticated = (req, res, next) => {

    if (req.user) {
      return next();
    }

    if (req.hostname === 'localhost' && !req.user) {
        req.user = { _id: '674062f7873942779301a301' }; // Set a default user object for localhost
        return next();
      }

    res.status(401).send({ error: 'You must be logged in to perform this action' });
  };