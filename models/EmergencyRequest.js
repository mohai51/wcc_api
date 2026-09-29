import mongoose from 'mongoose';

const emergencyResponseSchema = new mongoose.Schema({
  responder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responderName: {
    type: String,
    required: true,
    trim: true
  },
  responderRole: {
    type: String,
    default: 'ইমার্জেন্সি রেসপন্ডার'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const emergencyRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    hospital: {
      type: String,
      required: true,
      enum: [
        'ঝালকাঠি সদর হাসপাতাল',
        'বরিশাল শের-ই-বাংলা মেডিকেল কলেজ ও সদর হাসপাতাল',
        'অন্যান্য হাসপাতাল'
      ],
      default: 'ঝালকাঠি সদর হাসপাতাল'
    },
    ward: {
      type: String,
      trim: true,
      default: ''
    },
    contactName: {
      type: String,
      required: true,
      trim: true
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true
    },
    emergencyType: {
      type: String,
      required: true,
      enum: [
        'admission',
        'blood',
        'oxygen_bed',
        'medicine_ambulance',
        'financial_help',
        'other'
      ],
      default: 'admission'
    },
    urgency: {
      type: String,
      enum: ['critical', 'high', 'moderate'],
      default: 'high'
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
      index: true
    },
    assignedVolunteer: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      phone: String
    },
    responses: [emergencyResponseSchema],
    requester: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      phone: String
    }
  },
  {
    timestamps: true
  }
);

const EmergencyRequest = mongoose.models.EmergencyRequest || mongoose.model('EmergencyRequest', emergencyRequestSchema);
export default EmergencyRequest;
