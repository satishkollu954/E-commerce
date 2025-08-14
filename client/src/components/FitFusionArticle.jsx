import axios from "axios";
import { useEffect, useState } from "react";

export function FitFusionArticle() {
  const [adTitle, setAdTitle] = useState("Welcome to FitFusion");

  useEffect(() => {
    axios
      .get("http://localhost:3005/api/advertisement")
      .then((res) => {
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

        if (activeAds.length > 0) {
          setAdTitle(activeAds[0].title); // show first active ad
        } else {
          setAdTitle("WELCOME TO FitFusion"); // fallback title
        }
      })
      .catch(() => {
        setAdTitle("Welcome to FitFusion"); // fallback on error
      });
  }, []);

  return (
    <article className="container-fluid bg-dark text-white text-center py-2 px-3">
      <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-2">
        <span className="bi bi-lightning-charge-fill text-warning fs-5"></span>
        <span className="fs-6 fs-sm-5 text-wrap text-center">
          <div className="marquee">
            <marquee direction="left">{adTitle}</marquee>
          </div>
        </span>
        <span className="bi bi-lightning-charge-fill text-warning fs-5"></span>
      </div>
    </article>
  );
}
