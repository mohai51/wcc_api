import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialty: {
    type: String,
    default: 'General Medicine / সাধারণ স্বাস্থ্য',
    trim: true
  },
  hospital: {
    type: String,
    default: 'ঝালকাঠি সদর হাসপাতাল',
    trim: true
  },
  degree: {
    type: String,
    default: 'MBBS',
    trim: true
  }
});

const volunteerAssignmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    default: 'ক্যাম্প ভলান্টিয়ার',
    trim: true
  }
});

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

const healthCampSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      default: 'সকাল ৯:০০ - বিকাল ৪:০০',
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      default: 'ঝালকাঠি',
      trim: true
    },
    targetBeneficiaries: {
      type: String,
      default: '৫০০+ মানুষ',
      trim: true
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
      trim: true
    },
    doctors: [doctorSchema],
    services: {
      type: [String],
      default: [
        'বিনামূল্যে সাধারণ স্বাস্থ্য পরীক্ষা',
        'বিনামূল্যে প্রয়োজনীয় ওষুধ বিতরণ',
        'ব্লাড প্রেসার ও ডায়াবেটিস টেস্ট',
        'রক্তের গ্রুপ নির্ণয় (Blood Grouping)',
        'মা ও শিশু স্বাস্থ্য পরামর্শ'
      ]
    },
    assignedVolunteers: [volunteerAssignmentSchema],
    registeredParticipants: [participantSchema],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const HealthCamp = mongoose.models.HealthCamp || mongoose.model('HealthCamp', healthCampSchema);
export default HealthCamp;
