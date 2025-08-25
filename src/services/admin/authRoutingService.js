// Service xử lý phân quyền và chuyển hướng sau đăng nhập

/**
 * Định nghĩa các route cho từng role
 */
export const ROLE_ROUTES = {
  'Admin': '/dashboard',                 // Admin vào dashboard chính
  'admin': '/dashboard',                 // Fallback cho lowercase
  'Quản lý bếp': '/dashboard-kitchen',   // Quản lý bếp vào dashboard bếp
  'bếp': '/dashboard-kitchen',           // Fallback cho role từ admin_faces
  'Nhân viên': '/dashboard-staff',       // Nhân viên vào dashboard phục vụ
  'nhân viên': '/dashboard-staff',       // Fallback cho role từ admin_faces
  'default': '/dashboard'          // Route mặc định
};

/**
 * Lấy thông tin user từ localStorage
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Lấy token từ localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('admin_token');
};

/**
 * Kiểm tra user đã đăng nhập chưa
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getCurrentUser();
  return !!(token && user);
};

/**
 * Lấy role chính của user (ưu tiên role đầu tiên)
 */
export const getUserPrimaryRole = (user = null) => {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return null;

  // Kiểm tra roles array từ Laravel
  if (currentUser.roles && Array.isArray(currentUser.roles) && currentUser.roles.length > 0) {
    return currentUser.roles[0].name || currentUser.roles[0].role_name;
  }

  // Fallback: kiểm tra role từ admin_faces (single role)
  if (currentUser.role) {
    return currentUser.role;
  }

  return null;
};

/**
 * Lấy tất cả roles của user
 */
export const getUserRoles = (user = null) => {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return [];

  // Từ Laravel roles array
  if (currentUser.roles && Array.isArray(currentUser.roles)) {
    return currentUser.roles.map(role => role.name || role.role_name);
  }

  // Fallback: single role từ admin_faces
  if (currentUser.role) {
    return [currentUser.role];
  }

  return [];
};

/**
 * Kiểm tra user có role cụ thể không
 */
export const hasRole = (roleName, user = null) => {
  const userRoles = getUserRoles(user);
  return userRoles.some(role => 
    role.toLowerCase() === roleName.toLowerCase() ||
    role === roleName
  );
};

/**
 * Kiểm tra user có quyền admin không
 */
export const isAdmin = (user = null) => {
  return hasRole('Admin', user) || hasRole('admin', user);
};

/**
 * Kiểm tra user có quyền quản lý bếp không
 */
export const isKitchenManager = (user = null) => {
  return hasRole('Quản lý bếp', user) || hasRole('bếp', user);
};

/**
 * Kiểm tra user có quyền nhân viên không
 */
export const isStaff = (user = null) => {
  return hasRole('Nhân viên', user) || hasRole('nhân viên', user);
};

/**
 * Lấy route phù hợp dựa trên role của user
 */
export const getRouteForUser = (user = null) => {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return ROLE_ROUTES.default;

  const primaryRole = getUserPrimaryRole(currentUser);
  if (!primaryRole) return ROLE_ROUTES.default;

  // Tìm route dựa trên role
  const route = ROLE_ROUTES[primaryRole] || ROLE_ROUTES[primaryRole.toLowerCase()];
  return route || ROLE_ROUTES.default;
};

/**
 * Chuyển hướng user đến trang phù hợp sau đăng nhập
 */
export const redirectAfterLogin = (user = null, navigate = null) => {
  if (!navigate) {
    console.error('Navigate function is required for redirectAfterLogin');
    return;
  }

  const route = getRouteForUser(user);
  const currentUser = user || getCurrentUser();
  const primaryRole = getUserPrimaryRole(currentUser);

  console.log(`Redirecting user ${currentUser?.full_name} (${primaryRole}) to ${route}`);
  navigate(route);
};

/**
 * Đăng xuất user
 */
export const logout = (navigate = null) => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  
  if (navigate) {
    navigate('/admin/login');
  }
};

/**
 * Lấy thông tin hiển thị user
 */
export const getUserDisplayInfo = (user = null) => {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return null;

  return {
    name: currentUser.full_name || currentUser.username || 'Người dùng',
    email: currentUser.email || '',
    role: getUserPrimaryRole(currentUser) || 'Không xác định',
    roles: getUserRoles(currentUser)
  };
};

/**
 * Kiểm tra quyền truy cập route
 */
export const canAccessRoute = (routePath, user = null) => {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return false;

  // Định nghĩa quyền truy cập cho từng route
  const routePermissions = {
    '/dashboard': ['Admin', 'admin'],
    '/kitchen': ['Quản lý bếp', 'bếp', 'Admin', 'admin'],
    '/staff': ['Nhân viên', 'nhân viên', 'Admin', 'admin'],
    '/users': ['Admin', 'admin'],
    '/roles': ['Admin', 'admin'],
    '/settings': ['Admin', 'admin']
  };

  const userRoles = getUserRoles(currentUser);
  const allowedRoles = routePermissions[routePath];

  if (!allowedRoles) return true; // Route không có hạn chế

  return allowedRoles.some(allowedRole => 
    userRoles.some(userRole => 
      userRole.toLowerCase() === allowedRole.toLowerCase() ||
      userRole === allowedRole
    )
  );
};

export default {
  ROLE_ROUTES,
  getCurrentUser,
  getAuthToken,
  isAuthenticated,
  getUserPrimaryRole,
  getUserRoles,
  hasRole,
  isAdmin,
  isKitchenManager,
  isStaff,
  getRouteForUser,
  redirectAfterLogin,
  logout,
  getUserDisplayInfo,
  canAccessRoute
};
