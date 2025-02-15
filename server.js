const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");  // ✅ 引入 CORS
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());  // ✅ 允许跨域访问

app.get("/place", async (req, res) => {
    const place = req.query.place;
    if (!place) {
        return res.status(400).json({ error: "Missing place name" });
    }

    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    const googleUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(place)}&inputtype=textquery&fields=photos,rating&key=${GOOGLE_PLACES_API_KEY}`;

    try {
        const response = await fetch(googleUrl);
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            const placeData = data.candidates[0];
            const rating = placeData.rating || "No rating available";
            const photoRef = placeData.photos ? placeData.photos[0].photo_reference : null;
            const photoUrl = photoRef ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_PLACES_API_KEY}` : null;

            return res.json({ rating, photo: photoUrl });
        } else {
            return res.json({ rating: "No rating available", photo: null });
        }
    } catch (error) {
        console.error("Google API Error:", error);
        return res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
