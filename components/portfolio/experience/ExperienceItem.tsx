import Image from "next/image";

import { ExperienceItemProps } from "./types";

export function ExperienceItem({
  companyImage,
  companyName,
  jobType,
  jobTitle,
  startDate,
  endDate,
}: ExperienceItemProps) {
  return (
    <>
      <div className="text-sm flex font-light items-center">
        <Image
          className="mr-4 max-h-12 max-w-12"
          width={70}
          height={70}
          src={companyImage}
          alt={`${companyName} image`}
        />
        <div>
          <h1 className="font-medium text-base">{jobTitle}</h1>{" "}
          <p>
            {companyName}
            {jobType && ` • ${jobType}`}
          </p>
          {(startDate || endDate) && (
            <p className="text-zinc-500">
              {startDate && `${startDate}`}
              {endDate && ` - ${endDate}`}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
