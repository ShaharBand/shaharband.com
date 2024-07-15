import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EducationItem } from "./EducationItem";
import ArielUniversityLogo from "../../../public/education/Ariel_University_logo.svg";
import OpenUniversityLogo from "../../../public/education/the_open_university_of_israel_logo.jpg";

export function EducationCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Education 🎓</CardTitle>
        <CardDescription>
          Academic degrees and the institutions where I earned them.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4">
        <EducationItem
          schoolImage={OpenUniversityLogo.src}
          schoolName={"The Open University of Israel"}
          degreeType={"Master's"}
          fieldOfStudy={"Computer Science"}
          startDate={"Jul 2024"}
          endDate={"Currently"}
        />
        <EducationItem
          schoolImage={ArielUniversityLogo.src}
          schoolName={"Ariel University"}
          degreeType={"Bachelor's"}
          fieldOfStudy={"Mathematics and Computer Science"}
          startDate={"Oct 2018"}
          endDate={"Jul 2021"}
        />
        <EducationItem
          schoolImage={ArielUniversityLogo.src}
          schoolName={"Ariel University"}
          degreeType={"Bachelor's"}
          fieldOfStudy={"Mechanical Engineering"}
          startDate={"Oct 2017"}
          endDate={"Jul 2021"}
        />
      </CardContent>
    </Card>
  );
}
