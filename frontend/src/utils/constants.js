export const CATEGORIES = [
  'Textbooks',
  'Calculators',
  'Graphics Tools',
  'Engineering Instruments',
  'Lab Equipment',
  'Study Materials',
  'Others',
];

export const CONDITIONS = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Poor',
];

export const STATUSES = [
  'Available',
  'Reserved',
  'Sold',
  'Donated',
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  student: 'Student',
  admin: 'Admin',
};

export const MAX_IMAGE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const TOKEN_KEY = 'cm_auth_token';
export const USER_KEY = 'cm_auth_user';
