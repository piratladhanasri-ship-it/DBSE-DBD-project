import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ShieldCheckIcon, RadioIcon, TimerResetIcon, ScaleIcon, GavelIcon, SearchIcon, TrophyIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { AuctionCard } from '../../components/AuctionCard';
import { CountdownTimer } from '../../components/CountdownTimer';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuctions } from '../../context/AuctionContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';
import { auctionCover } from '../../data/auctions';

const STEPS = [
{
  icon: SearchIcon,
  title: 'Browse',
  text: 'Filter live and upcoming lots by category, price band and closing time. Every listing is admin-verified before it opens.'
},
{
  icon: GavelIcon,
  title: 'Bid',
  text: 'Place a bid above the current high. Bids, bidder counts and countdowns update live for everyone watching the lot.'
},
{
  icon: TrophyIcon,
  title: 'Win',
  text: 'When the clock stops, the highest bid wins. Pay through the secure checkout and the seller is settled after clearance.'
}];


const FEATURES = [
{ icon: RadioIcon, title: 'Real-time bidding', text: 'Socket-driven updates keep the current bid and ledger in sync without a refresh.' },
{ icon: TimerResetIcon, title: 'Anti-sniping window', text: 'A bid in the final minute adds 30 seconds, so last-second snipes cannot win unchallenged.' },
{ icon: ShieldCheckIcon, title: 'Verified listings', text: 'Administrators review provenance and condition reports before an auction goes live.' },
{ icon: ScaleIcon, title: 'Dispute resolution', text: 'Buyers and sellers can raise a dispute with evidence; settlement is held until it closes.' }];


export function Home() {
  const { auctions, isWatched, toggleWatch } = useAuctions();
  const { isAuthenticated, user } = useAuth();

  const live = auctions.filter((a) => a.status === 'live');
  const hero = live.find((a) => a.featured) || live[0];
  const featured = live.filter((a) => a.id !== hero?.id).slice(0, 3);
  const totalBids = auctions.reduce((sum, a) => sum + a.bidCount, 0);

  return (
    <div className="w-full">
      {/* ------------------------------------------------------------- hero */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-shell gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Timed online auctions</p>
            <h1 className="mt-4 font-display text-[40px] leading-[1.05] text-navy-900 sm:text-[56px] lg:text-[64px]">
              Bid with confidence on objects worth keeping.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-600">
              BidVault runs timed auctions for watches, art, coins, instruments and collectibles. Sellers list verified lots, buyers
              bid in real time, and every transaction settles through escrow once payment clears.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/auctions" size="lg">
                Explore auctions
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button to={isAuthenticated && user.role === 'seller' ? '/seller/create' : '/register'} size="lg" variant="outline">
                Start selling
              </Button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
              <div>
                <dt className="text-xs text-navy-400">Live lots</dt>
                <dd className="nums mt-1 text-xl font-semibold text-navy-900">{live.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-navy-400">Bids placed</dt>
                <dd className="nums mt-1 text-xl font-semibold text-navy-900">{totalBids}</dd>
              </div>
              <div>
                <dt className="text-xs text-navy-400">Verified sellers</dt>
                <dd className="nums mt-1 text-xl font-semibold text-navy-900">3</dd>
              </div>
            </dl>
          </div>

          {/* Hero lot — the one thing a visitor came for */}
          {hero ?
          <div className="overflow-hidden rounded-card border border-line bg-white shadow-card">
              <div className="relative aspect-[4/3] bg-mist">
                <img src={auctionCover(hero)} alt={hero.title} className="h-full w-full object-cover" />
                <span className="absolute left-4 top-4">
                  <StatusBadge status="live" label="Closing now" />
                </span>
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-400">{hero.category}</p>
                <h2 className="mt-1.5 text-lg font-semibold leading-snug text-navy-900">{hero.title}</h2>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
                  <div>
                    <p className="text-xs text-navy-400">Current bid · {hero.bidCount} bids</p>
                    <p className="nums text-2xl font-semibold text-navy-900">{formatCurrency(hero.currentBid)}</p>
                  </div>
                  <CountdownTimer endAt={hero.endAt} status={hero.status} />
                </div>
                <Link
                to={`/auctions/${hero.id}`}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-navy-900 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-navy-800">
                
                  View auction
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div> :
          null}
        </div>
      </section>

      {/* -------------------------------------------------- featured lots */}
      <section className="mx-auto max-w-shell px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-navy-900">Live auctions</h2>
            <p className="mt-1.5 text-sm text-navy-500">Lots currently open for bidding, ordered by closing time.</p>
          </div>
          <Link
            to="/auctions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 transition-colors duration-150 ease-out hover:text-navy-900">
            
            View all auctions
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((auction) =>
          <AuctionCard
            key={auction.id}
            auction={auction}
            watched={isWatched(auction.id)}
            onToggleWatch={isAuthenticated && user.role === 'buyer' ? toggleWatch : undefined} />

          )}
        </div>
      </section>

      {/* ------------------------------------------------- how it works */}
      <section className="border-y border-line bg-mist">
        <div className="mx-auto max-w-shell px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-navy-900">How it works</h2>
          <p className="mt-1.5 max-w-xl text-sm text-navy-500">Three steps from browsing a catalogue to taking delivery.</p>

          <ol className="mt-8 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
            {STEPS.map((step, i) =>
            <li key={step.title} className="flex flex-col bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="nums flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <h3 className="text-base font-semibold text-navy-900">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-navy-500">{step.text}</p>
              </li>
            )}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------ features */}
      <section className="mx-auto max-w-shell px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="font-display text-3xl text-navy-900">Built for fair closes</h2>
            <p className="mt-3 text-sm leading-relaxed text-navy-600">
              The platform models users, auctions, bids, payments, watchlists, notifications, disputes and reviews as first-class
              entities, so every action a buyer or seller takes leaves an auditable record.
            </p>
            <Button to="/how-it-works" variant="outline" size="sm" className="mt-6">
              Read the full process
            </Button>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f) =>
            <li key={f.title} className="rounded-card border border-line bg-white p-5 shadow-card">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                  <f.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-3.5 text-sm font-semibold text-navy-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{f.text}</p>
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* ----------------------------------------------------------- cta */}
      <section className="bg-navy-900">
        <div className="mx-auto flex max-w-shell flex-col items-start gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-3xl text-white">Have something worth auctioning?</h2>
            <p className="mt-2 max-w-xl text-sm text-navy-200">
              List your lot with a reserve, set the close time, and let verified buyers compete. You keep control of the catalogue,
              we handle the clock and the money.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button to="/register" variant="gold" size="lg">
              Start selling
            </Button>
            <Button to="/auctions" size="lg" className="bg-navy-800 hover:bg-navy-700">
              Browse catalogue
            </Button>
          </div>
        </div>
      </section>
    </div>);

}