import db from '../db/index.js';

/**
 * Authentication & Identity Middleware
 * Reads x-user-id and x-user-role headers (mock authentication for prototype)
 * and attaches verified user info to req.user.
 */
export function authMiddleware(req, res, next) {
  const headerUserId = req.headers['x-user-id'];
  const headerUserRole = req.headers['x-user-role'];

  // Default fallback user is Sarah Jenkins (EMPLOYEE) if no headers provided
  const defaultUser = db.store.users[0]; // Sarah Jenkins
  const foundUser = headerUserId
    ? db.store.users.find(u => u.id === headerUserId)
    : null;

  if (foundUser) {
    req.user = {
      ...foundUser,
      // If client explicitly passed a role header, honor it or use user's db role
      role: (headerUserRole || foundUser.role).toUpperCase()
    };
  } else if (headerUserId && headerUserRole) {
    req.user = {
      id: headerUserId,
      full_name: 'Custom User',
      email: 'user@autoflow.ai',
      role: headerUserRole.toUpperCase(),
      department: 'Operations'
    };
  } else {
    // Default to first user
    req.user = {
      ...defaultUser,
      role: (headerUserRole || defaultUser.role).toUpperCase()
    };
  }

  next();
}

export default authMiddleware;
