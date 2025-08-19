import { FitFusionArticle } from "./FitFusionArticle";
import { FitFusionMain } from "./FitFusionMain";
import { FitFusionOrderStats } from "./FitFusionOrderStats";
import { FitFusionViewAdvertisement } from "./FitFusionViewAdvertisement";

export function FitFusionIndex() {
  return (
    <div className="container-fluid">
      <FitFusionArticle />
      <FitFusionViewAdvertisement />
      <FitFusionMain />
      <FitFusionOrderStats />
    </div>
  );
}
