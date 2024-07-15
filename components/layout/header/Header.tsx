import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  return (
    <div className="flex items-center gap-4 font-semibold text-xs">
      <Avatar>
        <AvatarImage src="https://github.com/shaharband.png" />
        <AvatarFallback>SB</AvatarFallback>
      </Avatar>
      <h1>Home</h1>
    </div>
  );
}
