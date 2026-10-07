import db from '../db/index.js';

export async function getUsers(req, res, next) {
  try {
    const users = db.store.users.map(u => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      department: u.department
    }));
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export default {
  getUsers
};
