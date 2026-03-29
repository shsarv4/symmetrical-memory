// These are handled by Firebase Auth directly, but we keep for consistency
export async function loginUser(email, password) {
  // Actual login via Firebase Auth in AuthContext
  return { success: false, error: 'Use useAuth' };
}

export async function registerUser(email, password) {
  // Actual registration via Firebase Auth in AuthContext
  return { success: false, error: 'Use useAuth' };
}

export async function logoutUser() {
  // Actual logout via Firebase Auth in AuthContext
  return { success: false, error: 'Use useAuth' };
}
