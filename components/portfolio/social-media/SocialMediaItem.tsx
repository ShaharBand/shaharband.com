import Image from "next/image";

import { UrlItemProps } from "./types";
import Link from "next/link";

export function SocialMediaItem({
  urlIcon,
  urlSource,
  urlLabel,
}: UrlItemProps) {
  return (
    <Link href={urlSource} target="_blank" className="flex items-center">
      <Image
        className="mr-4 max-h-12 max-w-12"
        width={20}
        height={20}
        src={urlIcon}
        alt={`${urlLabel} image`}
      />

      <p className="font-medium text-base">{urlLabel}</p>
    </Link>
  );
}
