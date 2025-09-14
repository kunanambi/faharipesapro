import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";

export function AdBanner() {
  const adImage = PlaceHolderImages.find(img => img.id === 'ad-banner-1');

  if (!adImage) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-[4/1] w-full cursor-pointer">
          <Image
            src={adImage.imageUrl}
            alt={adImage.description}
            fill
            className="object-cover"
            data-ai-hint={adImage.imageHint}
          />
           <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">Advertisement</div>
        </div>
      </CardContent>
    </Card>
  );
}
