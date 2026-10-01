import Image from "next/image";

export function Identity() {
  return (
    <section className="identity">
      <div className="portrait">
        <Image
          src="https://github.com/shaharband.png"
          alt="Shahar Band"
          width={108}
          height={108}
          priority
          unoptimized
        />
      </div>
      <h1>Shahar Band</h1>
      <p className="subtitle">Building something new.</p>
    </section>
  );
}
