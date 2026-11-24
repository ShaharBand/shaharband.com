import Image from "next/image";

export function ProfileCard() {
  return (
    <div className="tile">
      <div className="portrait">
        <Image
          src="https://github.com/shaharband.png"
          alt="Shahar Band"
          width={96}
          height={96}
          priority
          unoptimized
        />
      </div>
      <div>
        <span className="tile-name">Shahar Band</span>
        <span className="tile-meta">Founder</span>
      </div>
    </div>
  );
}
