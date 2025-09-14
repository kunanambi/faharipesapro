import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { PlayCircle } from "lucide-react";

export function VideoSection() {
    const videoThumbs = PlaceHolderImages.filter(img => img.id.startsWith('video-thumb-'));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Featured Videos</CardTitle>
        <CardDescription>
          Watch our latest videos to learn more about maximizing your earnings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {videoThumbs.map((video) => (
                <div key={video.id} className="group relative cursor-pointer overflow-hidden rounded-lg">
                    <Image
                        src={video.imageUrl}
                        alt={video.description}
                        width={400}
                        height={225}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        data-ai-hint={video.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-white/80 transition-all group-hover:text-white group-hover:scale-110" />
                    </div>
                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <h3 className="text-sm font-semibold text-white">Video Title Goes Here</h3>
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
