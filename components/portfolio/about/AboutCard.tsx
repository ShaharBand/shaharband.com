import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AboutCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-x-4">
          Hi! I am Shahar Band 👋
        </CardTitle>
        <CardDescription>
          I'm a software developer from Israel. 🇮🇱
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="w-full">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Dedicated and motivated multidisciplinary software developer with
              a strong foundation in Computer Science, Mathematics, and
              Research.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              I love software and I am seeking to contribute and grow
              professionally and personally.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
/* eslint-enable react/no-unescaped-entities */
