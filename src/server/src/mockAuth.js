// Mock authentication middleware for development
module.exports = (req, res, next) => {
    console.log('Running mockAuth middleware');
    req.user = { id: 1, role: 'organizer' };
    console.log('req.user =', req.user);
    next();
  };