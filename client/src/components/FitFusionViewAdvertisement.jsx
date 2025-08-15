import React, { useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";
import axios from "axios";

export function FitFusionViewAdvertisement() {
  const [validImages, setValidImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      const res = await axios.get("http://localhost:3005/api/advertisement");

      const today = new Date();
      const todayDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const activeAds = res.data.filter((ad) => {
        if (!ad.isActive) return false;

        const start = new Date(new Date(ad.startDate).setHours(0, 0, 0, 0));
        const end = new Date(new Date(ad.endDate).setHours(23, 59, 59, 999));

        return start <= todayDateOnly && end >= todayDateOnly;
      });

      const imageItems = activeAds.flatMap(
        (ad) =>
          ad.images?.map((imgPath, idx) => ({
            id: `${ad._id}-${idx}`,
            imgPath: `http://localhost:3005${imgPath}`,
            title: ad.title,
            description: ad.description,
            link: ad.link,
          })) || []
      );

      setValidImages(imageItems);
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleImageError = (id) => {
    setValidImages((prev) => prev.filter((img) => img.id !== id));
  };

  if (loading || validImages.length === 0) return null;

  return (
    <Carousel
      fade
      interval={1500}
      controls={false}
      pause={false}
      className="mt-1"
    >
      {validImages.map((item) => (
        <Carousel.Item key={item.id}>
          <a href={item.link || "#"} target="_blank" rel="noreferrer">
            <img
              src={item.imgPath}
              alt={item.title}
              style={{ objectFit: "cover", height: "400px", width: "100%" }}
              onError={() => handleImageError(item.id)}
            />
          </a>
          {item.description && (
            <Carousel.Caption>
              <p>{item.description}</p>
            </Carousel.Caption>
          )}
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
