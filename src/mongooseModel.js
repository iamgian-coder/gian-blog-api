const mongoose = require("mongoose");

// Uncomment the next line to enable mongoose debug mode
// mongoose.set("debug", true);
const mongoosePaginate = require("mongoose-paginate-v2");

const articleSchema = new mongoose.Schema(
  {
    title: String,
    postAt: Date,
    updateAt: Date,
    tags: Array,
    views: Number,
    liked: Number,
    markdown: String,
    isPublished: Boolean,
    isDeleted: Boolean,
  },
  {
    autoIndex: true,
  }
);

articleSchema.index({ title: 1 });

articleSchema.index({ tags: 1 });

articleSchema.index({ views: -1 });

articleSchema.index({ liked: -1 });

articleSchema.index({ postAt: -1 });

articleSchema.index({ postAt: -1, liked: -1, views: -1 });

articleSchema.plugin(mongoosePaginate);

const articleModel = mongoose.model("Article", articleSchema);

articleModel.on("index", (err) => {
  if (err) {
    console.error("Create indexes failed: %s", err);
  } else {
    console.info("Create indexes succeed");
  }
});

module.exports = {
  articleModel,
};
