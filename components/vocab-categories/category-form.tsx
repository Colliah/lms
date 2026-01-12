"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/actions/vocab-category";
import { toast } from "sonner";

interface CategoryFormProps {
  mode: "create" | "edit";
  category?: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const colorOptions = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#808080", label: "Gray" },
];

export function CategoryForm({
  mode,
  category,
  trigger,
  onSuccess,
}: CategoryFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(
    category?.color || colorOptions[5].value
  );
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.set("color", selectedColor);

    try {
      let result;

      if (mode === "create") {
        result = await createCategoryAction(formData);
      } else if (category) {
        result = await updateCategoryAction(category.id, formData);
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        mode === "create" ? "Category created" : "Category updated"
      );
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create New Category" : "Edit Category"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a new vocabulary category to organize your flashcards."
                : "Update your category details."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., IELTS, Travel, Business"
                defaultValue={category?.name}
                required
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of this category..."
                defaultValue={category?.description || ""}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex justify-center items-center flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      selectedColor === color.value
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
