import { Calculator } from "@/components/Calculator";

export default function CalculatorPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-stone-800 tracking-tight mb-1">
        vector calculator
      </h2>
      <Calculator />
    </main>
  );
}
