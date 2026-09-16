/**
 * Mock `auctions` table. Mirrors the MySQL entity:
 * auctions(auction_id, seller_id, title, description, category, starting_price,
 *          current_bid, bid_increment, start_at, end_at, status, created_at)
 *
 * Timestamps are generated relative to load time so countdowns are always live
 * during a demo. Replace this module with auctionService calls once the
 * Node/Express API is connected.
 */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const now = Date.now();
const from = (offset) => new Date(now + offset).toISOString();

export const IMAGES = {
  watch: "/c51284d6-5844-4c23-ad8c-9cf7747cbb66.jpg",
  camera: "/29a9aef8-6a0e-40ac-b7da-b7d641a90353.jpg",
  painting: "/2f9cc07b-60ea-4025-a00e-94b5b023a4e4.jpg",
  guitar: "/edb50271-4843-42d9-826c-d2571f56d101.jpg",
  card: "/6636873a-e961-4b87-b045-6061f064a2ad.jpg",
  coin: "/9a25baf5-aa5f-4863-8979-15fb6022ee92.jpg",
  sneakers: "/27a7a461-a744-4476-8570-238704c22c9b.jpg",
  vase: "/f7672190-5103-4360-a3d4-c0d450f7effa.jpg",
  laptop: "/3373ddca-4915-4a5f-ba86-404c3c1cf6bc.jpg",
  manuscript: "/06c0a671-26f6-49e0-ad4f-c9d32fb01679.jpg"
};

export const categories = [
'Watches',
'Cameras',
'Art',
'Instruments',
'Collectibles',
'Coins & Currency',
'Fashion',
'Antiques',
'Electronics',
'Rare Books'];


export const auctionStatuses = ['live', 'upcoming', 'ended', 'pending', 'rejected'];

export const auctions = [
{
  id: 'a-101',
  title: '1969 Heuer Carrera Chronograph, Ref. 2447',
  category: 'Watches',
  sellerId: 'u-2',
  sellerName: 'Devansh Rao',
  sellerStore: 'Heritage Horology',
  condition: 'Excellent, serviced 2025',
  location: 'Mumbai, MH',
  description:
  'Manual-wind Valjoux 72 movement, serviced in March 2025 by an authorised watchmaker. Original cream dial with faint patina on the sub-registers, unpolished steel case measuring 36mm, and a replacement tan calf strap. Comes with the service invoice and a photo record of the movement before reassembly. No box or papers.',
  startingPrice: 180000,
  currentBid: 246500,
  bidIncrement: 2500,
  bidCount: 34,
  watchers: 212,
  startAt: from(-3 * DAY),
  endAt: from(2 * MINUTE + 40 * 1000),
  status: 'live',
  reserveMet: true,
  images: ['watch', 'camera', 'coin'],
  featured: true
},
{
  id: 'a-102',
  title: 'Leica M3 Double Stroke Body, 1955',
  category: 'Cameras',
  sellerId: 'u-2',
  sellerName: 'Devansh Rao',
  sellerStore: 'Heritage Horology',
  condition: 'Very good, fully working',
  location: 'Mumbai, MH',
  description:
  'Early double-stroke M3 body with matching serial on the top plate and baseplate. Shutter speeds tested accurate across the range, rangefinder patch is bright with light haze at the edges. Vulcanite intact with a small lift near the strap lug. Body only — no lens included.',
  startingPrice: 95000,
  currentBid: 142000,
  bidIncrement: 2000,
  bidCount: 21,
  watchers: 96,
  startAt: from(-2 * DAY),
  endAt: from(5 * HOUR + 12 * MINUTE),
  status: 'live',
  reserveMet: true,
  images: ['camera', 'watch'],
  featured: true
},
{
  id: 'a-103',
  title: 'Untitled Ochre Study — K. Raman, 1978',
  category: 'Art',
  sellerId: 'u-5',
  sellerName: 'Ananya Nair',
  sellerStore: 'Nair Antiques',
  condition: 'Good, original frame',
  location: 'Kochi, KL',
  description:
  'Oil on canvas board, 45 x 38 cm, signed lower right and dated 1978 on the reverse. Acquired from the artist estate sale in 2019; the gallery label is still attached to the backing board. Thin teak frame with minor edge wear. Ships crated and insured.',
  startingPrice: 60000,
  currentBid: 88000,
  bidIncrement: 1500,
  bidCount: 12,
  watchers: 61,
  startAt: from(-1 * DAY),
  endAt: from(1 * DAY + 4 * HOUR),
  status: 'live',
  reserveMet: false,
  images: ['painting', 'vase'],
  featured: true
},
{
  id: 'a-104',
  title: '1974 Sunburst Electric Guitar, Original Hardware',
  category: 'Instruments',
  sellerId: 'u-5',
  sellerName: 'Ananya Nair',
  sellerStore: 'Nair Antiques',
  condition: 'Good, playable',
  location: 'Kochi, KL',
  description:
  'Three-tone sunburst finish with honest buckle wear on the back. Original pickups and chrome hardware, frets at roughly 70 percent, truss rod moves freely. Set up with 10-46 strings and playing cleanly with low action. Hard case included.',
  startingPrice: 120000,
  currentBid: 155000,
  bidIncrement: 2500,
  bidCount: 18,
  watchers: 74,
  startAt: from(-4 * DAY),
  endAt: from(3 * DAY),
  status: 'live',
  reserveMet: true,
  images: ['guitar', 'manuscript'],
  featured: false
},
{
  id: 'a-105',
  title: 'Graded Rookie Card, PSA 9 Slab',
  category: 'Collectibles',
  sellerId: 'u-2',
  sellerName: 'Devansh Rao',
  sellerStore: 'Heritage Horology',
  condition: 'PSA 9 (Mint)',
  location: 'Mumbai, MH',
  description:
  'Sealed PSA 9 slab with a clean label and no scratches on the case. Centering is strong front and back with sharp corners under loupe. Certification number available on request for verification on the PSA registry before bidding closes.',
  startingPrice: 40000,
  currentBid: 71500,
  bidIncrement: 1000,
  bidCount: 27,
  watchers: 133,
  startAt: from(-5 * DAY),
  endAt: from(8 * HOUR),
  status: 'live',
  reserveMet: true,
  images: ['card', 'coin'],
  featured: false
},
{
  id: 'a-106',
  title: 'Gupta Period Gold Dinar, c. 400 CE',
  category: 'Coins & Currency',
  sellerId: 'u-5',
  sellerName: 'Ananya Nair',
  sellerStore: 'Nair Antiques',
  condition: 'Fine, certified',
  location: 'Kochi, KL',
  description:
  'Gold dinar weighing 7.8 g with a clear obverse portrait and legible reverse legend. Accompanied by a numismatic certificate issued in 2021 and an export clearance letter. Stored in an inert capsule since certification.',
  startingPrice: 210000,
  currentBid: 268000,
  bidIncrement: 5000,
  bidCount: 15,
  watchers: 88,
  startAt: from(-6 * DAY),
  endAt: from(2 * DAY + 6 * HOUR),
  status: 'live',
  reserveMet: true,
  images: ['coin', 'manuscript'],
  featured: false
},
{
  id: 'a-107',
  title: 'Deadstock High-Top Sneakers, UK 9',
  category: 'Fashion',
  sellerId: 'u-6',
  sellerName: 'Kabir Sheth',
  sellerStore: 'Sheth Collectibles',
  condition: 'Deadstock, unworn',
  location: 'Ahmedabad, GJ',
  description:
  'Unworn pair in UK 9 with both original laces and the inner tissue intact. Midsole is white with no yellowing; box has shelf wear on one corner. Stored in a climate-controlled unit since purchase in 2022.',
  startingPrice: 18000,
  currentBid: 24500,
  bidIncrement: 500,
  bidCount: 9,
  watchers: 47,
  startAt: from(-2 * DAY),
  endAt: from(45 * MINUTE),
  status: 'live',
  reserveMet: false,
  images: ['sneakers'],
  featured: false
},
{
  id: 'a-108',
  title: 'Qing Dynasty Blue & White Porcelain Vase',
  category: 'Antiques',
  sellerId: 'u-5',
  sellerName: 'Ananya Nair',
  sellerStore: 'Nair Antiques',
  condition: 'Very good, no restoration',
  location: 'Kochi, KL',
  description:
  'Hand-painted floral panels on a 32 cm baluster body, unrestored with a single firing flaw near the foot rim. Consigned from a private Kerala collection with a 1998 purchase receipt. Condition report and additional images available on request.',
  startingPrice: 320000,
  currentBid: 0,
  bidIncrement: 5000,
  bidCount: 0,
  watchers: 39,
  startAt: from(2 * DAY),
  endAt: from(9 * DAY),
  status: 'upcoming',
  reserveMet: false,
  images: ['vase', 'painting'],
  featured: false
},
{
  id: 'a-109',
  title: '14-inch Aluminium Laptop, 1TB (Sealed)',
  category: 'Electronics',
  sellerId: 'u-2',
  sellerName: 'Devansh Rao',
  sellerStore: 'Heritage Horology',
  condition: 'New, sealed',
  location: 'Mumbai, MH',
  description:
  'Factory-sealed unit, 1TB storage and 16GB memory, purchased in a corporate bulk order and surplus to requirement. Invoice dated June 2026 included for warranty transfer. Bidders may request a video of the sealed carton.',
  startingPrice: 85000,
  currentBid: 91000,
  bidIncrement: 1000,
  bidCount: 6,
  watchers: 21,
  startAt: from(-7 * DAY),
  endAt: from(-2 * HOUR),
  status: 'ended',
  reserveMet: true,
  winnerId: 'u-1',
  winnerName: 'Rhea Kulkarni',
  images: ['laptop'],
  featured: false
},
{
  id: 'a-110',
  title: 'Leather-Bound First Edition, 1902',
  category: 'Rare Books',
  sellerId: 'u-5',
  sellerName: 'Ananya Nair',
  sellerStore: 'Nair Antiques',
  condition: 'Good, tight binding',
  location: 'Kochi, KL',
  description:
  'First edition in original calf binding with raised bands and gilt rules. Foxing on the front endpapers, text block clean and tight throughout. Previous owner bookplate on the inside cover. Housed in a custom clamshell box.',
  startingPrice: 55000,
  currentBid: 64500,
  bidIncrement: 1500,
  bidCount: 11,
  watchers: 33,
  startAt: from(-10 * DAY),
  endAt: from(-1 * DAY),
  status: 'ended',
  reserveMet: true,
  winnerId: 'u-9',
  winnerName: 'Nikhil Bose',
  images: ['manuscript'],
  featured: false
},
{
  id: 'a-111',
  title: 'Art Deco Silver Tea Service, 6 Pieces',
  category: 'Antiques',
  sellerId: 'u-2',
  sellerName: 'Devansh Rao',
  sellerStore: 'Heritage Horology',
  condition: 'Very good',
  location: 'Mumbai, MH',
  description:
  'Six-piece service in 92.5 silver with hallmarks on each base, total weight 2.4 kg. Light surface scratches consistent with age, no dents or repairs. Awaiting platform verification of the hallmark assay report before going live.',
  startingPrice: 145000,
  currentBid: 0,
  bidIncrement: 2500,
  bidCount: 0,
  watchers: 0,
  startAt: from(3 * DAY),
  endAt: from(10 * DAY),
  status: 'pending',
  submittedAt: from(-6 * HOUR),
  reserveMet: false,
  images: ['vase'],
  featured: false
},
{
  id: 'a-112',
  title: 'Modern Abstract Canvas, Signed 2021',
  category: 'Art',
  sellerId: 'u-6',
  sellerName: 'Kabir Sheth',
  sellerStore: 'Sheth Collectibles',
  condition: 'Mint',
  location: 'Ahmedabad, GJ',
  description:
  'Acrylic on stretched canvas, 60 x 60 cm, signed on the reverse. Purchased directly from the artist studio in 2021 with a certificate of authenticity. Pending verification of the certificate scan submitted with the listing.',
  startingPrice: 32000,
  currentBid: 0,
  bidIncrement: 1000,
  bidCount: 0,
  watchers: 0,
  startAt: from(4 * DAY),
  endAt: from(11 * DAY),
  status: 'pending',
  submittedAt: from(-22 * HOUR),
  reserveMet: false,
  images: ['painting'],
  featured: false
}];


/**
 * Resolves the short image keys above into full urls. Keys created by the
 * seller upload form are already absolute (http/blob) and pass straight through.
 */
export function auctionImages(auction) {
  return (auction.images || []).map((key) => {
    if (IMAGES[key]) return IMAGES[key];
    const value = String(key);
    return value.startsWith('http') || value.startsWith('blob') || value.startsWith('data:') ? value : IMAGES.watch;
  });
}

export function auctionCover(auction) {
  return auctionImages(auction)[0];
}

export function findAuction(id) {
  return auctions.find((a) => a.id === id);
}