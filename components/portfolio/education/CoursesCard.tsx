import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EducationItem } from "./EducationItem";
import StanfordUniversityLogo from "../../../public/education/Stanford_Cardinal_logo.svg";
import IBMLogo from "../../../public/education/IBM_logo.svg";

export function CoursesCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Courses 👨‍🏫</CardTitle>
        <CardDescription>
          A detailed look at the courses I&apos;ve completed and the
          institutions where I gained valuable knowledge.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4">
        <EducationItem
          schoolImage={IBMLogo.src}
          schoolName={"IBM"}
          degreeType={""}
          fieldOfStudy={"Introduction to DevOps"}
          startDate={"February 21, 2024"}
          endDate={""}
        />
        <EducationItem
          schoolImage={StanfordUniversityLogo.src}
          schoolName={"Stanford University"}
          degreeType={""}
          fieldOfStudy={"Neural Networks and Deep Learning"}
          startDate={"June 17, 2023"}
          endDate={""}
        />
        <EducationItem
          schoolImage={StanfordUniversityLogo.src}
          schoolName={"Stanford University"}
          degreeType={""}
          fieldOfStudy={"Machine Learning Specialization"}
          startDate={"March 12, 2023"}
          endDate={""}
        />
      </CardContent>
    </Card>
  );
}
