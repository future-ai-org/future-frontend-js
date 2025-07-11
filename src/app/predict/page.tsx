import PredictCards from "../../components/Predict";
import predictStrings from "../../i18n/predict.json";
import "../../styles/predict.css";

export default function PredictPage() {
  return (
    <main className="min-h-screen">
      <div className="predict-header">
        <h1 className="predict-title">{predictStrings.en.title}</h1>
      </div>
      <PredictCards />
    </main>
  );
}

export const dynamic = "force-dynamic";
