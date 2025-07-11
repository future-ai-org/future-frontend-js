import PredictCards from "../../components/Predict";
import "../../styles/predict.css";

export default function PredictPage() {
  return (
    <main className="min-h-screen mt-20">
      <PredictCards />
    </main>
  );
}

export const dynamic = "force-dynamic";
