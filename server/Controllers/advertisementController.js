const Advertisement = require("../Models/Advertisement");
const fs = require("fs");
const path = require("path");

/**
 * @desc Add a new advertisement
 */
exports.addAdvertisement = async (req, res) => {
  try {
    let {
      title,
      description,
      images = [], // temp upload paths from frontend
      link,
      couponCode,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      applicableCategories,
      applicableProducts,
      startDate,
      endDate,
      usageLimit,
      perUserLimit,
      isActive,
    } = req.body;
    // console.log("=====", req.body);

    if (!title || !images.length || !startDate || !endDate) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Create the advertisement with empty images (will update after moving)
    const advertisement = new Advertisement({
      title,
      description,
      images: [],
      link,
      couponCode,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      applicableCategories,
      applicableProducts,
      startDate,
      endDate,
      usageLimit,
      perUserLimit,
      isActive,
      createdBy: req.user?.name || "Super Admin",
    });

    const savedAd = await advertisement.save();

    // Final image folder
    const finalDir = path.join(
      __dirname,
      `../uploads/advertisements/${savedAd._id}/images`
    );
    fs.mkdirSync(finalDir, { recursive: true });

    const movedPaths = [];

    // Move files from temp to final folder
    for (const imgPath of images) {
      const filename = path.basename(imgPath);
      const tempPath = path.join(
        __dirname,
        `../uploads/advertisements/temp/images/${filename}`
      );
      const newPath = path.join(finalDir, filename);

      if (fs.existsSync(tempPath)) {
        fs.renameSync(tempPath, newPath);
        movedPaths.push(`/advertisements/${savedAd._id}/images/${filename}`);
      }
    }

    // Update ad with final image paths
    savedAd.images = movedPaths;
    await savedAd.save();

    res.status(201).json({
      message: "Advertisement created successfully",
      advertisement: savedAd,
    });
  } catch (error) {
    console.error("Add Advertisement Error:", error);
    res.status(500).json({
      message: "Failed to add advertisement",
      error: error.message,
    });
  }
};

/**
 * @desc Get all advertisements
 */
exports.getAllAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch advertisements",
      error: error.message,
    });
  }
};

/**
 * @desc Get advertisement by ID
 */
exports.getAdvertisementById = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad)
      return res.status(404).json({ message: "Advertisement not found" });
    res.json(ad);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch advertisement", error: error.message });
  }
};

/**
 * @desc Update advertisement
 */
exports.updateAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad)
      return res.status(404).json({ message: "Advertisement not found" });

    const {
      images, // optional new images
      ...fields // all other fields from req.body
    } = req.body;

    // Handle images separately
    if (images && images.length) {
      // Delete old images
      ad.images.forEach((img) => {
        const imgPath = path.join(__dirname, `../uploads${img}`);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });

      // Move new images from temp folder
      const finalDir = path.join(
        __dirname,
        `../uploads/advertisements/${ad._id}/images`
      );
      fs.mkdirSync(finalDir, { recursive: true });

      const movedPaths = [];
      for (const imgPath of images) {
        const filename = path.basename(imgPath);
        const tempPath = path.join(
          __dirname,
          `../uploads/advertisements/temp/images/${filename}`
        );
        const newPath = path.join(finalDir, filename);

        if (fs.existsSync(tempPath)) {
          fs.renameSync(tempPath, newPath);
          movedPaths.push(`/advertisements/${ad._id}/images/${filename}`);
        }
      }
      ad.images = movedPaths;
    }

    // Update other fields dynamically
    for (const key in fields) {
      if (fields[key] !== undefined) {
        ad[key] = fields[key];
      }
    }

    await ad.save();

    res.json({
      message: "Advertisement updated successfully",
      advertisement: ad,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update advertisement",
      error: error.message,
    });
  }
};

/**
 * @desc Delete advertisement
 */
exports.deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad)
      return res.status(404).json({ message: "Advertisement not found" });

    // Remove images from disk
    ad.images.forEach((img) => {
      const imgPath = path.join(__dirname, `../uploads${img}`);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });

    // Remove directory for the ad
    const adDir = path.join(__dirname, `../uploads/advertisements/${ad._id}`);
    if (fs.existsSync(adDir)) {
      fs.rmSync(adDir, { recursive: true, force: true });
    }

    await ad.deleteOne();
    res.json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete advertisement",
      error: error.message,
    });
  }
};
