import mongoose from 'mongoose';

const healthTaskSchema = new mongoose.Schema(
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
    assignedTo: {
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
      email: {
        type: String,
        trim: true
      }
    },
    camp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthCamp'
    },
    campTitle: {
      type: String,
      default: '',
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const HealthTask = mongoose.models.HealthTask || mongoose.model('HealthTask', healthTaskSchema);
export default HealthTask;
