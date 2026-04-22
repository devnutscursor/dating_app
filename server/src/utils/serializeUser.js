function mapMedia(items) {
  if (!items?.length) return [];
  return items
    .filter(Boolean)
    .map((item) => {
      try {
        const o = item.toObject ? item.toObject() : { ...item };
        o.id = o._id?.toString() || o.id;
        delete o._id;
        return o;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/** Shape user document for JSON responses (matches frontend `User` id string) */
export function serializeUser(doc) {
  if (!doc) return null;
  const u = doc.toObject ? doc.toObject() : { ...doc };
  u.id = u._id?.toString();
  delete u._id;
  delete u.__v;
  delete u.password;
  delete u.emailVerificationOtpHash;
  delete u.emailVerificationOtpExpires;
  u.photos = mapMedia(u.photos || []);
  u.videos = mapMedia(u.videos || []);
  return u;
}
