import mongoose from 'mongoose'

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    block: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: String,
      required: true,
      trim: true,
    },
    cabin: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'In Class', 'Meeting', 'On Leave'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  },
)

const Faculty = mongoose.model('Faculty', facultySchema)

export default Faculty