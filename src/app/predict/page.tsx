import PredictCards from "../../components/Predict";
import predictStrings from "../../i18n/predict.json";
import "../../styles/predict.css";

export default function PredictPage() {
  return (
    <main className="min-h-screen">
      <div className="predict-container">
        <div className="predict-header">
          <h1 className="predict-title">{predictStrings.en.title}</h1>
        </div>
        <div className="predict-content">
          <PredictCards />
        </div>
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
