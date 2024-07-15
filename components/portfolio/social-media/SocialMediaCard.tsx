import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SocialMediaItem } from "./SocialMediaItem";
import LinkedInIcon from "../../../public/socialmedia/LinkedIn_icon.svg";
import XIcon from "../../../public/socialmedia/X_icon.svg";
import GitHubIcon from "../../../public/socialmedia/GitHub_icon.svg";
import GmailIcon from "../../../public/socialmedia/Gmail_icon.svg";

export function SocialMediaCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Social Media 🔗</CardTitle>
        <CardDescription>
          Connect with me on social media or reach out via email. Here are my
          profiles and contact information.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SocialMediaItem
          urlIcon={LinkedInIcon.src}
          urlSource={"https://www.linkedin.com/in/shahar-band/"}
          urlLabel={"Shahar Band"}
        />
        <SocialMediaItem
          urlIcon={XIcon.src}
          urlSource={"https://x.com/shahar_band"}
          urlLabel={"shahar_band"}
        />
        <SocialMediaItem
          urlIcon={GitHubIcon.src}
          urlSource={"https://github.com/ShaharBand"}
          urlLabel={"ShaharBand"}
        />
        <SocialMediaItem
          urlIcon={GmailIcon.src}
          urlSource={"mailto://Shahar1531@gmail.com"}
          urlLabel={"Shahar1531@gmail.com"}
        />
      </CardContent>
    </Card>
  );
}
