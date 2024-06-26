"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronsUpDown, Plus, X } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react"

export default function Home() {
  const [isOpenEducation, setIsOpenEducation] = useState(true);
  return (
    <main className="container flex flex-col items-center justify-center mx-auto relative">
      <Avatar className="relative -bottom-10 h-20 w-20">
        <AvatarImage src="https://github.com/shaharband.png" />
        <AvatarFallback>SB</AvatarFallback>
      </Avatar>
 
      <Card className="w-4/6">
        <CardHeader>
          <CardTitle>Hi! I am Shahar Band 👋</CardTitle>
          <CardDescription>
          I'm a software developer from Israel. 🇮🇱
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="w-full">
              
              <p className="text-sm text-zinc-500 dark:text-zinc-400 -mt-6">
              I have been building APIs and tools for Machine Learning and Cybersecurity, with different teams and organizations.
              </p>

              <Separator className="my-4" />
              <Collapsible
                    open={isOpenEducation}
                    onOpenChange={setIsOpenEducation}
                    className="w-full space-y-2"
                  >
                    <div className="flex items-center justify-between space-x-4">
                      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        Education
                      </h3>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                          <ChevronsUpDown className="h-4 w-4" />
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="space-y-2">
                      <div className="rounded-md border px-4 py-3 text-sm">
                        Ariel University - BSc Mathematics and Computer Science
                      </div>
                      <div className="rounded-md border px-4 py-3 text-sm">
                        Ariel University - BSc Mechanical Engineering
                      </div>
                      <div className="rounded-md border px-4 py-3 text-sm">
                        The Open University - MSc Computer Science
                      </div>
                    </CollapsibleContent>
              </Collapsible>
              <Separator className="my-4" />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col justify-between">
          <div className="flex h-5 items-center space-x-4 text-sm">
            <div>Twitter</div>
            <Separator orientation="vertical" />
            <div>Github</div>
            <Separator orientation="vertical" />
            <div>Email</div>
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}