export default function AboutPage() {
  return (
    <main className="w-full px-6 md:px-10 lg:px-16 py-16 md:py-24">
      <div className="max-w-[720px] mx-auto">
        <h1 className="text-sm font-semibold uppercase tracking-wider text-black/60 mb-6">About</h1>
        <p className="text-base md:text-lg text-black/80 leading-relaxed">
          I&apos;m Bryan, a computer science student at Carnegie Mellon University, exploring AI, HCI, and 3D.
          You can find me on <a href="https://github.com/byung806" className="text-black underline hover:no-underline">GitHub</a> and <a href="https://www.linkedin.com/in/bryan-yung-9724952b9/" className="text-black underline hover:no-underline">LinkedIn</a>, or reach out at byung806@gmail.com.
        </p>
      </div>
    </main>
  );
}
