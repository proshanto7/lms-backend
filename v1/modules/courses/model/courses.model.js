import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    level: {
      type: String,
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: "Level must be one of: beginner, intermediate, advanced",
      },
      default: "beginner",
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      default: "English",
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      default: null,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    totalDuration: {
      type: Number, // minutes
      default: 0,
      min: [0, "Total duration cannot be negative"],
    },
    totalLectures: {
      type: Number,
      default: 0,
      min: [0, "Total lectures cannot be negative"],
    },
    requirements: {
      type: [String],
      default: [],
    },
    whatYouWillLearn: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
    },
    students: {
      type: Number,
      default: 0,
      min: [0, "Students count cannot be negative"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    image: {
      url: {
        type: String,
        required: [true, "Image URL is required"],
      },
      publicId: {
        type: String,
        required: [true, "Image public ID is required"],
      },
    },
  },
  { timestamps: true, versionKey: false },
);

courseSchema.pre("validate", function () {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // discountPrice must never exceed the regular price
  if (
    this.discountPrice != null &&
    this.price != null &&
    this.discountPrice > this.price
  ) {
    this.invalidate(
      "discountPrice",
      "Discount price cannot be greater than the regular price",
    );
  }

  // isFree and price/discountPrice shouldn't contradict each other
  if (this.isFree) {
    this.price = 0;
    this.discountPrice = null;
  }
});

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
