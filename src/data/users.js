/**
 * Mock `users` table. Mirrors the MySQL entity:
 * users(user_id, name, email, role, status, joined_at, rating, location)
 */
export const users = [
{
  id: 'u-1',
  name: 'Rhea Kulkarni',
  email: 'buyer@bidvault.in',
  role: 'buyer',
  status: 'active',
  joinedAt: '2024-08-14',
  location: 'Pune, MH',
  rating: 4.8,
  phone: '+91 98200 41122',
  bidsPlaced: 148,
  auctionsWon: 9,
  avatar: null
},
{
  id: 'u-2',
  name: 'Devansh Rao',
  email: 'seller@bidvault.in',
  role: 'seller',
  status: 'active',
  joinedAt: '2023-11-02',
  location: 'Mumbai, MH',
  rating: 4.9,
  phone: '+91 99300 77410',
  storeName: 'Heritage Horology',
  totalSales: 62,
  avatar: null
},
{
  id: 'u-3',
  name: 'Meera Iyer',
  email: 'admin@bidvault.in',
  role: 'admin',
  status: 'active',
  joinedAt: '2023-01-20',
  location: 'Bengaluru, KA',
  rating: null,
  phone: '+91 99450 20018',
  avatar: null
},
{
  id: 'u-4',
  name: 'Arjun Mehta',
  email: 'arjun.mehta@gmail.com',
  role: 'buyer',
  status: 'active',
  joinedAt: '2025-02-11',
  location: 'Delhi, DL',
  rating: 4.5,
  bidsPlaced: 61,
  auctionsWon: 3
},
{
  id: 'u-5',
  name: 'Ananya Nair',
  email: 'ananya@nairantiques.com',
  role: 'seller',
  status: 'active',
  joinedAt: '2024-03-30',
  location: 'Kochi, KL',
  rating: 4.7,
  storeName: 'Nair Antiques',
  totalSales: 38
},
{
  id: 'u-6',
  name: 'Kabir Sheth',
  email: 'kabir.sheth@outlook.com',
  role: 'seller',
  status: 'suspended',
  joinedAt: '2024-06-18',
  location: 'Ahmedabad, GJ',
  rating: 3.4,
  storeName: 'Sheth Collectibles',
  totalSales: 11
},
{
  id: 'u-7',
  name: 'Sara Fernandes',
  email: 'sara.fernandes@gmail.com',
  role: 'buyer',
  status: 'active',
  joinedAt: '2025-05-07',
  location: 'Panaji, GA',
  rating: 4.9,
  bidsPlaced: 27,
  auctionsWon: 2
},
{
  id: 'u-8',
  name: 'Vikram Desai',
  email: 'vikram.desai@yahoo.com',
  role: 'buyer',
  status: 'pending',
  joinedAt: '2026-09-02',
  location: 'Surat, GJ',
  rating: null,
  bidsPlaced: 0,
  auctionsWon: 0
},
{
  id: 'u-9',
  name: 'Nikhil Bose',
  email: 'nikhil.bose@gmail.com',
  role: 'buyer',
  status: 'active',
  joinedAt: '2025-01-09',
  location: 'Kolkata, WB',
  rating: 4.2,
  bidsPlaced: 84,
  auctionsWon: 5
}];


/** Demo credentials surfaced on the login screen (frontend-only mock auth). */
export const demoAccounts = [
{ role: 'buyer', email: 'buyer@bidvault.in', password: 'buyer123', label: 'Buyer — Rhea Kulkarni' },
{ role: 'seller', email: 'seller@bidvault.in', password: 'seller123', label: 'Seller — Devansh Rao' },
{ role: 'admin', email: 'admin@bidvault.in', password: 'admin123', label: 'Admin — Meera Iyer' }];


export function findUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

export function findUserById(id) {
  return users.find((u) => u.id === id);
}