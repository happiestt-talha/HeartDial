import mongoose from 'mongoose';

const DialSchema = new mongoose.Schema({
  dialId: { type: String, required: true, unique: true, index: true },
  photoUrls: { type: [String], required: true },
  audioUrl: { type: String, required: true },
  message: { type: String, default: '', maxlength: 500 },
  isProtected: { type: Boolean, default: false },
  passwordHash: { type: String, default: null },
  passwordPlain: { type: String, default: null },
  creatorIp: { type: String, default: null },
  creatorUserAgent: { type: String, default: null },
  creatorReferer: { type: String, default: null },
  creatorLanguage: { type: String, default: null },
  clientFingerprint: { type: mongoose.Schema.Types.Mixed, default: null },
  geoLocation: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 60 } },
  viewCount: { type: Number, default: 0 },
  reactions: { type: Number, default: 0 },
});

// Avoid re-compiling the model in dev with hot reload
export default mongoose.models.Dial || mongoose.model('Dial', DialSchema);
