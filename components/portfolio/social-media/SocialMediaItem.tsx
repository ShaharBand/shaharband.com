import Image from "next/image";

import { UrlItemProps } from "./types";
import Link from "next/link";

export function SocialMediaItem({
  urlIcon,
  urlSource,
  urlLabel,
}: UrlItemProps) {
  return (
    <Link
      href={urlSource}
      target="_blank"
      className="flex items-center min-w-0"
    >
      <Image
        className="mr-4 w-5 h-5 object-contain flex-shrink-0"
        width={20}
        height={20}
        src={urlIcon}
        alt={`${urlLabel} image`}
      />

      <p className="font-medium text-base truncate">{urlLabel}</p>
    </Link>
  );
}
