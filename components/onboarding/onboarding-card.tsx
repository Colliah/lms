import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OnboardingCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function OnboardingCard({
  title,
  description,
  children,
}: OnboardingCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
