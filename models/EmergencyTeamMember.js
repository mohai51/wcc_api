import mongoose from 'mongoose';

const emergencyTeamMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    roleTitle: {
      type: String,
      default: 'ইমার্জেন্সি সেল ভলান্টিয়ার',
      trim: true
    },
    hospitalAssigned: {
      type: String,
      enum: ['all', 'jhalokathi', 'barishal'],
      default: 'all'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const EmergencyTeamMember =
  mongoose.models.EmergencyTeamMember ||
  mongoose.model('EmergencyTeamMember', emergencyTeamMemberSchema);

export default EmergencyTeamMember;
