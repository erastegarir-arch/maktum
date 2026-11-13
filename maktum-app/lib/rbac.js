// lib/rbac.js

// کلید مخفی امضای دیجیتال توکن‌ها و پیوند‌های بارگیری
export const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'MAKTUM_SUPER_SECRET_KEY_FOR_JWT_TOKEN');

// ==========================================
// ۱. فهرست بررسی کامل و دانه‌ریز دسترسی‌های مسئولیتی
// ویژگی requires: مشخص می‌کند این تیک تا زمانی که تیک والدش فعال نشده، غیرقابل انتخاب بماند.
// ==========================================
export const GRANULAR_PERMISSIONS = [
  // ------------------ چیدمان ------------------
  { id: 'IDENTITY_EDIT', category: 'چیدمان', label: 'هویت' },
  { id: 'HOMEPAGE_EDIT', category: 'چیدمان', label: 'مسئولیت صفحه اصلی' },
  { id: 'PAGES_EDIT', category: 'چیدمان', label: 'مسئولیت صفحات فرعی' },
  { id: 'ABOUT_EDIT', category: 'چیدمان', label: 'درباره ما' },
  { id: 'CAREER_EDIT', category: 'چیدمان', label: 'همکاری با ما' },
  { id: 'TERMS_EDIT', category: 'چیدمان', label: 'قوانین' },
  { id: 'PERSIAN_GUIDE_EDIT', category: 'چیدمان', label: 'شیوه‌نامه فارسی‌نویسی' }, // <-- سطح دسترسی مستقل اضافه شد

  // --------------- کتابخانه رسانه ---------------
  // نکته: دیدن فهرست رسانه‌ها پیش‌فرض برای همه مسئولان آزاد است
  { id: 'MEDIA_UPLOAD', category: 'کتابخانه رسانه', label: 'بارگذاری تصویر جدید' },
  { id: 'MEDIA_EDIT', category: 'کتابخانه رسانه', label: 'ویرایش مشخصات تصویر' },
  { id: 'MEDIA_DELETE', category: 'کتابخانه رسانه', label: 'حذف تصاویر' },

  // ----------------- طبقه بندی -----------------
  // نکته: دیدن دسته‌بندی‌ها پیش‌فرض برای همه مسئولان آزاد است
  { id: 'TAXONOMY_CREATE', category: 'طبقه بندی', label: 'ایجاد' },
  { id: 'TAXONOMY_EDIT', category: 'طبقه بندی', label: 'ویرایش' },
  { id: 'TAXONOMY_DELETE', category: 'طبقه بندی', label: 'حذف' },

  // ------------------- محتوا -------------------
  // نکته: دیدن محتواها پیش‌فرض برای همه مسئولان آزاد است
  { id: 'CONTENT_EDIT', category: 'محتوا', label: 'ویرایش (دسترسی پایه)' },
  { id: 'CONTENT_CREATE', category: 'محتوا', label: 'ایجاد', requires: 'CONTENT_EDIT' },
  { id: 'CONTENT_DELETE', category: 'محتوا', label: 'حذف', requires: 'CONTENT_EDIT' },

  // ------------------- منظومه -------------------
  { id: 'HUB_SETTINGS', category: 'منظومه', label: 'تنظیمات هاب' },
  { id: 'DOSSIER_EDIT', category: 'منظومه', label: 'مسئولیت هاب (ویرایش)' },
  { id: 'DOSSIER_CREATE', category: 'منظومه', label: 'ایجاد پرونده جدید', requires: 'DOSSIER_EDIT' },
  { id: 'DOSSIER_DELETE', category: 'منظومه', label: 'حذف پرونده', requires: 'DOSSIER_EDIT' },

  // ------------------ اعلانات ------------------
  { id: 'NOTIF_CREATE', category: 'اعلانات', label: 'امکان ارسال اعلان جدید' },
  { id: 'NOTIF_DELETE', category: 'اعلانات', label: 'امکان حذف اعلان' },

  // ------------------- نظرات -------------------
  { id: 'COMMENT_EDIT_REPLY', category: 'نظرات', label: 'ویرایش و پاسخ' },
  { id: 'COMMENT_APPROVE_REJECT', category: 'نظرات', label: 'تایید و رد نظر' },

  // ------------------ کاربران ------------------
  { id: 'USERS_VIEW', category: 'کاربران', label: 'صرفا دیدن فهرست کاربران' },
  { id: 'USERS_EXPORT', category: 'کاربران', label: 'خروجی اکسل گرفتن' },
  { id: 'USERS_CREATE', category: 'کاربران', label: 'افزودن کاربر جدید' },
  { id: 'USERS_EDIT', category: 'کاربران', label: 'ویرایش کاربران' },
  { id: 'USERS_BAN', category: 'کاربران', label: 'مسدود یا فعال کردن حساب' },
  { id: 'OTP_LOGS_VIEW', category: 'کاربران', label: 'مشاهده تاریخچه پیامک‌ها (OTP)' }
];

export const ALL_PERMISSION_IDS = GRANULAR_PERMISSIONS.map(p => p.id);

// ==========================================
// ۲. نگاشت مسیرهای درگاه مسئول به مجوزهای مورد نیاز (محافظت لایه ۲ در صورت نیاز)
// ==========================================
export const ADMIN_ROUTE_PERMISSIONS = [
  // محافظت از مسیرهای مربوط به بخش چیدمان
  { pathPrefix: '/portal-entry-99/pages/identity', requiredAny: ['IDENTITY_EDIT'] },
  { pathPrefix: '/portal-entry-99/pages/home', requiredAny: ['HOMEPAGE_EDIT'] },
  { pathPrefix: '/portal-entry-99/pages/main-page', requiredAny: ['PAGES_EDIT'] },
  { pathPrefix: '/portal-entry-99/pages/about-settings', requiredAny: ['ABOUT_EDIT'] },
  { pathPrefix: '/portal-entry-99/pages/collaboration-settings', requiredAny: ['CAREER_EDIT'] },
  { pathPrefix: '/portal-entry-99/pages/rules-settings', requiredAny: ['TERMS_EDIT'] },
  { pathPrefix: '/portal-entry-99/persian-guide', requiredAny: ['PERSIAN_GUIDE_EDIT'] },
  { pathPrefix: '/portal-entry-99/pages/persian-guide-settings', requiredAny: ['PERSIAN_GUIDE_EDIT'] },

  // برای ورود به صفحه کاربران، فرد باید حداقل یکی از مجوزهای کاربران را داشته باشد
  { pathPrefix: '/portal-entry-99/users', requiredAny: ['USERS_VIEW', 'USERS_EXPORT', 'USERS_CREATE', 'USERS_EDIT', 'USERS_BAN'] },
  
  // محدود کردن صفحه تاریخچه پیامک‌ها فقط به مسئولان دارای مجوز
  { pathPrefix: '/portal-entry-99/otp-logs', requiredAny: ['OTP_LOGS_VIEW'] },
  
  // برای دسترسی به اعلانات و نظرات داشتن تیک‌هایشان ضروری است
  { pathPrefix: '/portal-entry-99/notifications', requiredAny: ['NOTIF_CREATE', 'NOTIF_DELETE'] },
  { pathPrefix: '/portal-entry-99/comments', requiredAny: ['COMMENT_EDIT_REPLY', 'COMMENT_APPROVE_REJECT'] }
];

// ==========================================
// ۳. توابع بررسی دسترسی در فرانت‌اند و بک‌اند
// ==========================================
export function parsePermissions(permsInput) {
  if (!permsInput) return [];
  if (Array.isArray(permsInput)) return permsInput;
  try {
    let parsed = JSON.parse(permsInput);
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function checkUserPermission(user, permissionId) {
  if (!user || user.status === 'BANNED') return false;
  if (user.isSuperAdmin) return true; 
  if (!user.isAdmin) return false;

  const perms = parsePermissions(user.adminPermissions);
  return perms.includes(permissionId);
}

export function checkUserAnyPermission(user, permissionIds = []) {
  if (!user || user.status === 'BANNED') return false;
  if (user.isSuperAdmin) return true;
  if (!user.isAdmin) return false;
  if (permissionIds.length === 0) return true;

  const perms = parsePermissions(user.adminPermissions);
  return permissionIds.some(id => perms.includes(id));
}

// ==========================================
// ۴. موتور گذرواژه‌نگاری بومی توکن (سازگار با Edge proxy و Node.js)
// ==========================================
function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(base64Url) {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function getCryptoKey() {
  return await crypto.subtle.importKey(
    'raw',
    SECRET_KEY,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signSessionToken(payload, expiresInHours = 168) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(dataToSign)
  );

  let binarySig = '';
  const sigBytes = new Uint8Array(signatureBuffer);
  for (let i = 0; i < sigBytes.byteLength; i++) {
    binarySig += String.fromCharCode(sigBytes[i]);
  }
  const encodedSignature = btoa(binarySig).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${dataToSign}.${encodedSignature}`;
}

export async function verifySessionToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    let base64Sig = encodedSignature.replace(/-/g, '+').replace(/_/g, '/');
    while (base64Sig.length % 4) {
      base64Sig += '=';
    }
    const binarySig = atob(base64Sig);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const key = await getCryptoKey();
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}