/**
 * Local development server with auth and role-based access control.
 * Run: node src/local-server.js
 *
 * Default admin: admin@campus.edu / admin123
 */

import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword } from './utils/password.js';
import {
  generateToken,
  authenticate,
  sanitizeUser,
  canManageListing,
  ROLES,
} from './utils/auth.js';

const PORT = process.env.PORT || 3001;

const listings = new Map();
const buyRequests = new Map();
const users = new Map();
const usersByEmail = new Map();

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

async function seedAdminUser() {
  const adminId = uuidv4();
  const admin = {
    userId: adminId,
    name: 'Admin User',
    email: 'admin@campus.edu',
    passwordHash: await hashPassword('admin123'),
    role: ROLES.ADMIN,
    createdAt: new Date().toISOString(),
  };
  users.set(adminId, admin);
  usersByEmail.set(admin.email, admin);
  console.log('Seeded admin user: admin@campus.edu / admin123');
}

function send(res, statusCode, body) {
  res.writeHead(statusCode, CORS_HEADERS);
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function getAuthUser(req) {
  return authenticate({
    headers: { authorization: req.headers.authorization || '' },
  });
}

function requireAuth(req, res) {
  const user = getAuthUser(req);
  if (!user) {
    send(res, 401, { error: 'Authentication required' });
    return null;
  }
  return user;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  try {
    // POST /auth/register
    if (req.method === 'POST' && path === '/auth/register') {
      const body = await parseBody(req);
      const { name, email, password } = body;

      if (!name?.trim()) return send(res, 400, { error: 'Name is required' });
      if (!email?.trim()) return send(res, 400, { error: 'Email is required' });
      if (!password || password.length < 6) {
        return send(res, 400, { error: 'Password must be at least 6 characters' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (usersByEmail.has(normalizedEmail)) {
        return send(res, 409, { error: 'An account with this email already exists' });
      }

      const user = {
        userId: uuidv4(),
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        role: ROLES.STUDENT,
        createdAt: new Date().toISOString(),
      };
      users.set(user.userId, user);
      usersByEmail.set(user.email, user);

      const token = generateToken(user);
      return send(res, 201, { user: sanitizeUser(user), token });
    }

    // POST /auth/login
    if (req.method === 'POST' && path === '/auth/login') {
      const body = await parseBody(req);
      const user = usersByEmail.get(body.email?.trim().toLowerCase());

      if (!user || !(await comparePassword(body.password, user.passwordHash))) {
        return send(res, 401, { error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      return send(res, 200, { user: sanitizeUser(user), token });
    }

    // GET /auth/me
    if (req.method === 'GET' && path === '/auth/me') {
      const authUser = requireAuth(req, res);
      if (!authUser) return;

      const user = users.get(authUser.userId);
      if (!user) return send(res, 404, { error: 'User not found' });
      return send(res, 200, { user: sanitizeUser(user) });
    }

    // GET /auth/users (admin)
    if (req.method === 'GET' && path === '/auth/users') {
      const authUser = requireAuth(req, res);
      if (!authUser) return;
      if (authUser.role !== ROLES.ADMIN) {
        return send(res, 403, { error: 'Insufficient permissions' });
      }

      const allUsers = Array.from(users.values()).map(sanitizeUser);
      return send(res, 200, { users: allUsers });
    }

    // GET /admin/stats (admin)
    if (req.method === 'GET' && path === '/admin/stats') {
      const authUser = requireAuth(req, res);
      if (!authUser) return;
      if (authUser.role !== ROLES.ADMIN) {
        return send(res, 403, { error: 'Insufficient permissions' });
      }

      const allUsers = Array.from(users.values());
      const allListings = Array.from(listings.values());
      const sellerIds = new Set(allListings.map((listing) => listing.sellerId).filter(Boolean));
      const studentSellerCount = allUsers.filter(
        (user) => user.role === ROLES.STUDENT && sellerIds.has(user.userId)
      ).length;

      return send(res, 200, {
        stats: {
          totalUsers: allUsers.length,
          totalStudents: allUsers.filter((user) => user.role === ROLES.STUDENT).length,
          totalAdmins: allUsers.filter((user) => user.role === ROLES.ADMIN).length,
          totalListings: allListings.length,
          studentsWhoListed: studentSellerCount,
          totalBuyRequests: buyRequests.size,
          soldListings: allListings.filter((listing) => listing.status === 'Sold').length,
          availableListings: allListings.filter((listing) => (listing.status || 'Available') === 'Available').length,
        },
      });
    }

    // PUT /auth/users/:id/role (admin)
    const roleMatch = path.match(/^\/auth\/users\/([^/]+)\/role$/);
    if (req.method === 'PUT' && roleMatch) {
      const authUser = requireAuth(req, res);
      if (!authUser) return;
      if (authUser.role !== ROLES.ADMIN) {
        return send(res, 403, { error: 'Insufficient permissions' });
      }

      const target = users.get(roleMatch[1]);
      if (!target) return send(res, 404, { error: 'User not found' });

      const body = await parseBody(req);
      if (![ROLES.STUDENT, ROLES.ADMIN].includes(body.role)) {
        return send(res, 400, { error: 'Invalid role' });
      }
      if (target.userId === authUser.userId && body.role !== ROLES.ADMIN) {
        return send(res, 400, { error: 'You cannot demote your own admin account' });
      }

      target.role = body.role;
      return send(res, 200, { user: sanitizeUser(target) });
    }

    // GET /listings
    if (req.method === 'GET' && path === '/listings') {
      const all = Array.from(listings.values()).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      return send(res, 200, { listings: all });
    }

    // GET /listings/:id
    const getMatch = path.match(/^\/listings\/([^/]+)$/);
    if (req.method === 'GET' && getMatch) {
      const listing = listings.get(getMatch[1]);
      if (!listing) return send(res, 404, { error: 'Listing not found' });
      return send(res, 200, { listing });
    }

    // POST /listings (auth required)
    if (req.method === 'POST' && path === '/listings') {
      const authUser = requireAuth(req, res);
      if (!authUser) return;
      if (authUser.role !== ROLES.STUDENT) {
        return send(res, 403, { error: 'Only students can create listings' });
      }

      const body = await parseBody(req);
      const listing = {
        listingId: uuidv4(),
        productName: body.productName,
        category: body.category,
        condition: body.condition || 'Good',
        price: Number(body.price),
        description: body.description,
        contact: body.contact,
        pickupSpot: body.pickupSpot || '',
        imageUrl: body.imageUrl || (body.imageUrls && body.imageUrls[0]) || '',
        imageUrls: body.imageUrls || [],
        purchaseYear: body.purchaseYear ? Number(body.purchaseYear) : null,
        usageDuration: body.usageDuration || '',
        status: body.status || 'Available',
        sellerId: authUser.userId,
        sellerName: authUser.name,
        createdAt: new Date().toISOString(),
      };
      listings.set(listing.listingId, listing);
      return send(res, 201, { listing });
    }

    // PUT /listings/:id (owner or admin)
    const putMatch = path.match(/^\/listings\/([^/]+)$/);
    if (req.method === 'PUT' && putMatch) {
      const authUser = requireAuth(req, res);
      if (!authUser) return;

      const existing = listings.get(putMatch[1]);
      if (!existing) return send(res, 404, { error: 'Listing not found' });
      if (!canManageListing(authUser, existing)) {
        return send(res, 403, { error: 'You can only edit your own listings' });
      }

      const body = await parseBody(req);
      const updated = { ...existing, ...body, listingId: putMatch[1] };
      listings.set(putMatch[1], updated);
      return send(res, 200, { listing: updated });
    }

    // DELETE /listings/:id (owner or admin)
    const deleteMatch = path.match(/^\/listings\/([^/]+)$/);
    if (req.method === 'DELETE' && deleteMatch) {
      const authUser = requireAuth(req, res);
      if (!authUser) return;

      const existing = listings.get(deleteMatch[1]);
      if (!existing) return send(res, 404, { error: 'Listing not found' });
      if (!canManageListing(authUser, existing)) {
        return send(res, 403, { error: 'You can only delete your own listings' });
      }

      listings.delete(deleteMatch[1]);
      return send(res, 200, { message: 'Listing deleted successfully' });
    }

    // POST /buy-requests (auth required)
    if (req.method === 'POST' && path === '/buy-requests') {
      const authUser = requireAuth(req, res);
      if (!authUser) return;

      const body = await parseBody(req);
      const listing = listings.get(body.listingId);
      if (!listing) return send(res, 404, { error: 'Listing not found' });
      if (listing.sellerId === authUser.userId) {
        return send(res, 400, { error: 'You cannot send a buy request for your own listing' });
      }
      if (!body.buyerContact?.trim()) {
        return send(res, 400, { error: 'Buyer contact is required' });
      }

      const request = {
        requestId: uuidv4(),
        listingId: listing.listingId,
        productName: listing.productName,
        price: listing.price,
        buyerId: authUser.userId,
        buyerName: authUser.name,
        buyerContact: body.buyerContact.trim(),
        message: body.message?.trim() || '',
        sellerId: listing.sellerId,
        sellerName: listing.sellerName || '',
        sellerContact: listing.contact,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      buyRequests.set(request.requestId, request);
      return send(res, 201, { request });
    }

    // GET /buy-requests/buyer (auth required)
    if (req.method === 'GET' && path === '/buy-requests/buyer') {
      const authUser = requireAuth(req, res);
      if (!authUser) return;

      const requests = Array.from(buyRequests.values())
        .filter((request) => request.buyerId === authUser.userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return send(res, 200, { requests });
    }

    // GET /buy-requests/seller (auth required)
    if (req.method === 'GET' && path === '/buy-requests/seller') {
      const authUser = requireAuth(req, res);
      if (!authUser) return;

      const requests = Array.from(buyRequests.values())
        .filter((request) => request.sellerId === authUser.userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return send(res, 200, { requests });
    }

    // DELETE /buy-requests/:id (buyer, seller, or admin)
    const buyRequestDeleteMatch = path.match(/^\/buy-requests\/([^/]+)$/);
    if (req.method === 'DELETE' && buyRequestDeleteMatch) {
      const authUser = requireAuth(req, res);
      if (!authUser) return;

      const request = buyRequests.get(buyRequestDeleteMatch[1]);
      if (!request) return send(res, 404, { error: 'Buy request not found' });

      const canDelete = request.buyerId === authUser.userId ||
        request.sellerId === authUser.userId ||
        authUser.role === ROLES.ADMIN;
      if (!canDelete) return send(res, 403, { error: 'You cannot remove this buy request' });

      buyRequests.delete(buyRequestDeleteMatch[1]);
      return send(res, 200, { message: 'Buy request removed' });
    }

    // POST /upload (auth required)
    if (req.method === 'POST' && path === '/upload') {
      const authUser = requireAuth(req, res);
      if (!authUser) return;

      const body = await parseBody(req);
      const { image, contentType = 'image/jpeg' } = body;

      if (!image) {
        return send(res, 400, { error: 'Image data is required' });
      }

      const imageUrl = `data:${contentType};base64,${image}`;
      return send(res, 200, { imageUrl, key: `local/${uuidv4()}.jpg` });
    }

    send(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: err.message });
  }
});

await seedAdminUser();

server.listen(PORT, () => {
  console.log(`Local API server running at http://localhost:${PORT}`);
});
