import mongoose from 'mongoose';

const bloodDonorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 65
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male'
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      index: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      required: true,
      trim: true,
      default: 'ঝালকাঠি সদর'
    },
    district: {
      type: String,
      default: 'ঝালকাঠি',
      trim: true
    },
    lastDonationDate: {
      type: Date,
      default: null
    },
    donationCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['available', 'recently_donated', 'unavailable'],
      default: 'available',
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const BloodDonor = mongoose.models.BloodDonor || mongoose.model('BloodDonor', bloodDonorSchema);
export default BloodDonor;
