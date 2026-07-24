import mongoose, { Schema, models } from "mongoose";

const GoalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    parentGoalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 360,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    icon: {
      type: String,
      trim: true,
      maxlength: 10,
      default: "🎯",
    },
    
    color: {
      type: String,
      trim: true,
      default: "#18181b",
    },
    
    deadline: {
      type: Date,
      default: null,
    },
    
    estimatedHours: {
      type: Number,
      min: 0,
      default: null,
    },
    
    notes: {
      type: String,
      maxlength: 10000,
      default: "",
    },
    
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    level: {
      type: String,
      enum: ["lifetime", "yearly", "monthly", "daily"],
      default: "lifetime",
      index: true,
    },

    category: {
      type: String,
      enum: [
        "self-development",
        "business-work",
        "family",
        "hobby-personal",
        "public-affairs",
      ],
      default: null,
    },

    priorityType: {
      type: String,
      enum: ["must", "want"],
      default: null,
    },

    placement: {
      visionBoard: { type: Boolean, default: false },
      yearlyKanban: { type: Boolean, default: false },
      monthlyKanban: { type: Boolean, default: false },
      dailyKanban: { type: Boolean, default: false },
    },

    kanbanStatus: {
      yearly: {
        type: String,
        enum: ["todo", "planned", "done", null],
        default: null,
      },
      monthly: {
        type: String,
        enum: ["todo", "planned", "in-progress", "today", "done", null],
        default: null,
      },
      daily: {
        type: String,
        enum: ["todo", "in-progress", "done", null],
        default: null,
      },
    },

    order: {
      brainstorm: { type: Number, default: 0 },
      category: { type: Number, default: 0 },
      vision: { type: Number, default: 0 },
      yearly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
      daily: { type: Number, default: 0 },
    },

    completed: {
      type: Boolean,
      default: false,
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Goal = models.Goal || mongoose.model("Goal", GoalSchema);
