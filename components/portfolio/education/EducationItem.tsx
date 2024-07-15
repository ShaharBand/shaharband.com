import Image from "next/image";
import { EducationItemProps } from "./types";

export function EducationItem({
  schoolImage,
  schoolName,
  degreeType,
  fieldOfStudy,
  startDate,
  endDate,
}: EducationItemProps) {
  return (
    <>
      <div className="text-sm flex font-light items-center">
        <Image
          className="mr-4 max-h-12 max-w-12"
          width={70}
          height={70}
          src={schoolImage}
          alt={`${schoolName} image`}
        />
        <div>
          <h1 className="font-medium text-base">{schoolName}</h1>
          <p>
            {degreeType && `${degreeType}, `}
            {fieldOfStudy}
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
