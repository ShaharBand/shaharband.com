import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExperienceItem } from "./ExperienceItem";
import IDFLogo from "../../../public/experience/IDF_logo.svg";
import MinistryOfEducationLogo from "../../../public/experience/Ministry_of_Education_logo.svg";

export function ExperienceCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Experience 💼</CardTitle>
        <CardDescription>
          My professional journey, showcasing the diverse roles and companies
          I've contributed to.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4">
        <ExperienceItem
          companyImage={IDFLogo.src}
          companyName={"Israel Defense Forces"}
          jobType={"Full Time"}
          jobTitle={"Full Stack Developer"}
          startDate={"Oct 2021"}
          endDate={"May 2024 · 2 yrs 8 mos"}
        />
        <ExperienceItem
          companyImage={MinistryOfEducationLogo.src}
          companyName={"Ministry of Education Israel"}
          jobType={"Part Time"}
          jobTitle={"Computer Science Teacher"}
          startDate={"Sep 2023"}
          endDate={"Present · 11 mos"}
        />
      </CardContent>
    </Card>
  );
}
/* eslint-enable react/no-unescaped-entities */
