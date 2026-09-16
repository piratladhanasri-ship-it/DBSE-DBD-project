export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = 'Email is required.';else
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';else
  if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  return errors;
}

export function validateRegister({ name, email, password, confirmPassword, role }) {
  const errors = {};
  if (!name?.trim()) errors.name = 'Full name is required.';else
  if (name.trim().length < 3) errors.name = 'Name must be at least 3 characters.';
  if (!email?.trim()) errors.email = 'Email is required.';else
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';else
  if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';else
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  if (!role) errors.role = 'Select how you want to use the platform.';
  return errors;
}

export function validateAuctionForm(values) {
  const errors = {};
  if (!values.title?.trim()) errors.title = 'Product name is required.';else
  if (values.title.trim().length < 5) errors.title = 'Use a descriptive name (5+ characters).';
  if (!values.description?.trim()) errors.description = 'Description is required.';else
  if (values.description.trim().length < 40) errors.description = 'Describe condition and provenance (40+ characters).';
  if (!values.category) errors.category = 'Select a category.';
  if (!values.images?.length) errors.images = 'Add at least one product image.';
  if (!values.startingPrice) errors.startingPrice = 'Starting price is required.';else
  if (Number(values.startingPrice) <= 0) errors.startingPrice = 'Starting price must be greater than 0.';
  if (values.bidIncrement && Number(values.bidIncrement) <= 0) errors.bidIncrement = 'Bid increment must be greater than 0.';
  if (!values.startAt) errors.startAt = 'Auction start date and time is required.';
  if (!values.endAt) errors.endAt = 'Auction end date and time is required.';
  if (values.startAt && values.endAt && new Date(values.endAt) <= new Date(values.startAt)) {
    errors.endAt = 'End time must be after the start time.';
  }
  return errors;
}

export function validatePasswordChange({ current, next, confirm }) {
  const errors = {};
  if (!current) errors.current = 'Enter your current password.';
  if (!next) errors.next = 'Enter a new password.';else
  if (next.length < 8) errors.next = 'New password must be at least 8 characters.';
  if (next !== confirm) errors.confirm = 'Passwords do not match.';
  return errors;
}

export function validateBid(amount, { currentBid, minIncrement, status }) {
  const value = Number(amount);
  if (status === 'ended') return 'This auction has ended. Bidding is closed.';
  if (!amount) return 'Enter a bid amount.';
  if (Number.isNaN(value)) return 'Bid amount must be a number.';
  if (value <= Number(currentBid)) return 'Your bid must be higher than the current highest bid.';
  if (value < Number(currentBid) + Number(minIncrement)) {
    return `Minimum increment is ${minIncrement}. Bid at least ${Number(currentBid) + Number(minIncrement)}.`;
  }
  return '';
}

export function isEmpty(errors) {
  return Object.keys(errors).length === 0;
}