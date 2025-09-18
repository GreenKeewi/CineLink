import CineLinkMain from '@/components/cine-link-main';

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center px-4 py-8 md:py-12">
      <header className="mb-8 text-center md:mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl">
          CineLink
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Describe a movie, and I'll guess the title.
        </p>
      </header>
      <CineLinkMain />
    </main>
  );
}
