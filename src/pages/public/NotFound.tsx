import React from 'react';
import { Button } from '../../components/ui/Button';

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-shell flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-sm font-semibold text-gold-600">404</p>
      <h1 className="mt-3 font-display text-4xl text-navy-900 sm:text-5xl">This page has closed</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-500">
        The link may be out of date, or the lot it pointed to was removed. The live catalogue is always up to date.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button to="/auctions" size="lg">
          Browse auctions
        </Button>
        <Button to="/" size="lg" variant="outline">
          Back to home
        </Button>
      </div>
    </div>);

}