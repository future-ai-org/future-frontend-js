import Predict from "../../components/Predict";
import PredictCards from "../../components/PredictCards";

export default function PredictPage() {
  return (
    <main className="min-h-screen">
      <Predict />
      <PredictCards />
    </main>
  );
}

export const dynamic = "force-dynamic";
