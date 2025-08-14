import React, { useEffect, useState } from "react";
import { Carousel, Spinner } from "react-bootstrap";
import axios from "axios";

export function FitFusionViewAdvertisement() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      const res = await axios.get("http://localhost:3005/api/advertisement");
      // Only active ads whose date is valid
      const now = new Date();
      const activeAds = res.data.filter(
        (ad) =>
          ad.isActive &&
          new Date(ad.startDate) <= now &&
          new Date(ad.endDate) >= now
      );
      setAds(activeAds);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  if (loading) return <Spinner animation="border" />;

  if (ads.length === 0) return null;

  return (
    <Carousel fade>
      {ads.map((ad) => (
        <Carousel.Item key={ad._id}>
          <a href={ad.link || "#"} target="_blank" rel="noreferrer">
            <img
              className="d-block w-100"
              src={ad.images[0]} // show first image; for multiple images you could nest another carousel
              alt={ad.title}
            />
          </a>
          <Carousel.Caption>
            <h3>{ad.title}</h3>
            {ad.description && <p>{ad.description}</p>}
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
