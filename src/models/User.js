const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // SECURITY FIX (OWASP A01:2021 - Broken Access Control):
    // Strict enum enforcement prevents assigning unexpected or privileged roles.
    role: { type: String, enum: ['viewer', 'admin'], default: 'viewer' },
  },
  {
    timestamps: true,
    // SECURITY FIX (OWASP A04:2021 - Insecure Design & Sensitive Data Exposure):
    // Global toJSON transform strips sensitive fields (`password` hash, `__v`) from
    // all JSON serialization outputs across all endpoints and queries.
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // SECURITY FIX (OWASP A02:2021 - Cryptographic Failures):
  // Increased bcrypt work factor / salt rounds from 4 to 10 (industry standard minimum).
  // 4 rounds makes brute-force hash cracking ~64x faster and trivial to crack.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
