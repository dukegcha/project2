// Middleware to check for staff/manager roles
const authorizeStaff = (req, res, next) => {
  if (req.user.role !== 'staff' && req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Access denied. Staff only.' }); // Forbidden
  }
  next();
};

module.exports = authorizeStaff;
