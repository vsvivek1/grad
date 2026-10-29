import Gradation from "./Gradation";

export default function Page() {
  return (
    <main>
      <header className="top">
        <h1>KSEB AE Gradation</h1>
        <p>Who holds which post on a given date, and each engineer&apos;s projected career.</p>
      </header>
      <Gradation />
      <footer className="foot">
        Projection only. Assumes promotion strictly by gradation list order and retirement at the end of the month
        the retirement age is reached. Engineers with no date of birth on record are left out.
      </footer>
    </main>
  );
}
