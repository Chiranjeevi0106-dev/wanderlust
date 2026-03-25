const fetch = require("node-fetch");

const Listing = require("../models/listing");

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({path: "reviews",populate: {path: "author"}}).populate("owner");
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await new Promise(resolve => setTimeout(resolve, 1000));
  //  Geocode location using OpenStreetMap Nominatim 
const response = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(req.body.listing.location)}`,
  {
    headers: {
      "User-Agent": "wanderlust-app (skv.chiranjeevi@gmail.com)"
    }
  }
);

const text = await response.text();

let data;
try {
  data = JSON.parse(text);
} catch (err) {
  console.error("Nominatim blocked response:", text);
  req.flash("error", "Location service blocked. Try again later.");
  return res.redirect("/listings/new");
}

if (!data.length) {
  req.flash("error", "Invalid location");
  return res.redirect("/listings/new");
}

const lat = data[0].lat;
const lon = data[0].lon;

newListing.geometry = {
  type: "Point",
  coordinates: [lon, lat],
};

  // Cloudinary Image
  if (req.file) {
    newListing.image = {
      filename: req.file.filename,
      url: req.file.path,
    };
  }

  newListing.owner = req.user._id;

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if( typeof req.file != "undefined" ) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.index = async (req, res) => {
  const { category, search } = req.query;

  let filter = {};

  // CATEGORY FILTER
  if (category) {
    filter.category = category;
  }

  // SEARCH FILTER
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } }
    ];
  }

  const allListings = await Listing.find(filter);

  res.render("listings/index.ejs", { allListings });
};